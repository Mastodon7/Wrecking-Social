import {
  BadRequestException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { BrandVoiceWriteDto } from '@gitroom/nestjs-libraries/dtos/brand-voice/brand-voice.dto';

const AI_MODEL = 'claude-opus-5-5';
const WRITES_PER_DAY = 300;
const LEARNS_PER_DAY = 30;
const SAMPLE_POSTS = 60;

@Injectable()
export class BrandVoiceService {
  constructor(
    private _voice: PrismaRepository<'brandVoice'>,
    private _post: PrismaRepository<'post'>,
    private _integration: PrismaRepository<'integration'>
  ) {}

  aiConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  private key(integrationId?: string) {
    return !integrationId || integrationId === 'default' ? '' : integrationId;
  }

  private async checkChannel(organizationId: string, integrationId: string) {
    if (!integrationId) return null;
    const channel = await this._integration.model.integration.findFirst({
      where: { id: integrationId, organizationId, deletedAt: null },
      select: { id: true, name: true, providerIdentifier: true },
    });
    if (!channel) {
      throw new BadRequestException('Channel not found');
    }
    return channel;
  }

  private async limit(name: string, organizationId: string, max: number) {
    const counter = `brand-voice-${name}:${organizationId}:${dayjs().format('YYYY-MM-DD')}`;
    const used = await ioRedis.incr(counter);
    if (used === 1) {
      await ioRedis.expire(counter, 26 * 3600);
    }
    if (used > max) {
      throw new HttpException(
        { message: 'The daily limit for brand voice AI was reached. Try again tomorrow.' },
        429
      );
    }
  }

  private needAi() {
    if (!this.aiConfigured()) {
      throw new HttpException(
        { message: 'The AI assistant is not set up on this server' },
        503
      );
    }
  }

  private async ask<T>(
    system: string,
    content: string,
    schema: { [key: string]: unknown },
    maxTokens: number
  ) {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema },
      },
      system,
      messages: [{ role: 'user', content }],
    });
    if (response.stop_reason === 'refusal') {
      throw new BadRequestException('The AI declined this request');
    }
    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    return JSON.parse(text) as T;
  }

  async list(organizationId: string) {
    const voices = await this._voice.model.brandVoice.findMany({
      where: { organizationId },
      select: { integrationId: true, profile: true, learnedFrom: true, updatedAt: true },
    });
    return { voices, aiConfigured: this.aiConfigured() };
  }

  async save(organizationId: string, integrationId: string, profile: string) {
    const key = this.key(integrationId);
    await this.checkChannel(organizationId, key);
    if (!profile.trim()) {
      await this._voice.model.brandVoice.deleteMany({
        where: { organizationId, integrationId: key },
      });
      return { deleted: true };
    }
    return this._voice.model.brandVoice.upsert({
      where: { organizationId_integrationId: { organizationId, integrationId: key } },
      update: { profile: profile.trim() },
      create: { organizationId, integrationId: key, profile: profile.trim() },
      select: { integrationId: true, profile: true, learnedFrom: true, updatedAt: true },
    });
  }

  // Reads the channel's (or the whole account's) recent posts and writes a
  // style guide the writer follows. The owner can edit it afterwards.
  async learn(organizationId: string, integrationId: string, notes = '') {
    this.needAi();
    const key = this.key(integrationId);
    const channel = await this.checkChannel(organizationId, key);

    const posts = await this._post.model.post.findMany({
      where: {
        organizationId,
        deletedAt: null,
        parentPostId: null,
        state: { in: ['PUBLISHED', 'QUEUE'] },
        ...(key ? { integrationId: key } : {}),
      },
      orderBy: { publishDate: 'desc' },
      take: SAMPLE_POSTS,
      select: { content: true, integration: { select: { providerIdentifier: true } } },
    });
    const samples = posts
      .map((p) => ({
        platform: p.integration.providerIdentifier.split('-')[0],
        text: stripHtmlValidation('none', p.content || '', false)
          .replace(/\s+\n/g, '\n')
          .trim()
          .slice(0, 1200),
      }))
      .filter((p) => p.text.length >= 15);

    if (samples.length < 3 && notes.trim().length < 40) {
      throw new BadRequestException(
        'There are fewer than 3 posts to learn from. Add a few sentences about how your brand talks, then try again.'
      );
    }

    await this.limit('learn', organizationId, LEARNS_PER_DAY);

    const result = await this.ask<{ profile: string }>(
      'You study a business\'s own social media posts and write its brand voice guide, which ' +
        'another writer will follow to write new posts that sound like this business. Cover: ' +
        'who it is and who it talks to; tone and personality; sentence length and structure; ' +
        'vocabulary and phrases it uses (quote short examples); emoji and hashtag habits; how ' +
        'posts usually open and close (calls to action); formatting (line breaks, lists); and a ' +
        'short "avoid" list. Base it on the posts and the owner\'s notes only. Write it as a ' +
        'plain-text guide of 150 to 350 words with short labelled sections, no markdown headers.',
      JSON.stringify({
        channel: channel ? { name: channel.name, platform: channel.providerIdentifier } : 'all channels',
        ownerNotes: notes.slice(0, 2000),
        posts: samples,
      }),
      {
        type: 'object',
        additionalProperties: false,
        required: ['profile'],
        properties: { profile: { type: 'string' } },
      },
      4000
    );

    return this._voice.model.brandVoice.upsert({
      where: { organizationId_integrationId: { organizationId, integrationId: key } },
      update: { profile: result.profile.trim(), learnedFrom: samples.length },
      create: {
        organizationId,
        integrationId: key,
        profile: result.profile.trim(),
        learnedFrom: samples.length,
      },
      select: { integrationId: true, profile: true, learnedFrom: true, updatedAt: true },
    });
  }

  // Rewrites the editor's text, or writes a post from an idea, in the
  // channel's voice (falling back to the default voice)
  async write(organizationId: string, body: BrandVoiceWriteDto) {
    this.needAi();
    const key = this.key(body.integrationId);
    const channel = await this.checkChannel(organizationId, key);
    const voices = await this._voice.model.brandVoice.findMany({
      where: { organizationId, integrationId: { in: [...new Set([key, ''])] } },
    });
    const voice =
      voices.find((v) => v.integrationId === key) || voices.find((v) => v.integrationId === '');
    if (!voice) {
      throw new BadRequestException(
        'Set up a brand voice first: Settings, then Brand voice, then Learn from past posts.'
      );
    }
    if (!body.text.trim()) {
      throw new BadRequestException(
        body.mode === 'rewrite' ? 'Write something to rewrite first.' : 'Describe the post idea first.'
      );
    }

    await this.limit('write', organizationId, WRITES_PER_DAY);

    const platform = (channel?.providerIdentifier || body.platform || 'social media').split('-')[0];
    const result = await this.ask<{ text: string }>(
      'You write social media posts for a business, following its brand voice guide exactly. ' +
        (body.mode === 'rewrite'
          ? 'Rewrite the given draft in that voice. Keep its facts, offers, links, prices, dates ' +
            'and @mentions exactly; do not add facts. '
          : 'Write one post from the given idea in that voice. Do not invent prices, dates, ' +
            'discounts or claims that are not in the idea; leave a [placeholder] if one is needed. ') +
        `Fit the platform (${platform}). Return only the post text, with line breaks where the ` +
        'voice uses them.',
      JSON.stringify({
        brandVoiceGuide: voice.profile,
        platform,
        [body.mode === 'rewrite' ? 'draft' : 'idea']: body.text.slice(0, 8000),
      }),
      {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: { text: { type: 'string' } },
      },
      4000
    );

    return {
      text: result.text.trim(),
      voice: voice.integrationId ? 'channel' : 'default',
    };
  }
}
