import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

const AI_MODEL = 'claude-opus-5-5';
const PER_DAY = 200;

@Injectable()
export class CarouselService {
  constructor(private _voice: PrismaRepository<'brandVoice'>) {}

  aiConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  // The words of a carousel: a cover, the slides and a closing call to
  // action, plus a caption, in the brand voice when one is saved
  async write(
    organizationId: string,
    body: { topic: string; slides?: number; integrationId?: string; platform?: string }
  ) {
    if (!this.aiConfigured()) {
      throw new HttpException({ message: 'The AI assistant is not set up on this server' }, 503);
    }
    const topic = (body.topic || '').trim();
    if (topic.length < 5) {
      throw new BadRequestException('Describe what the carousel is about');
    }
    const counter = `carousel:${organizationId}:${dayjs().format('YYYY-MM-DD')}`;
    const used = await ioRedis.incr(counter);
    if (used === 1) await ioRedis.expire(counter, 26 * 3600);
    if (used > PER_DAY) {
      throw new HttpException({ message: 'The daily limit for carousels was reached. Try again tomorrow.' }, 429);
    }

    const slides = Math.min(Math.max(Math.round(body.slides || 6), 3), 10);
    const voices = await this._voice.model.brandVoice.findMany({
      where: { organizationId, integrationId: { in: ['', body.integrationId || ''] } },
      select: { integrationId: true, profile: true },
    });
    const voice =
      voices.find((v) => v.integrationId && v.integrationId === body.integrationId)?.profile ||
      voices.find((v) => v.integrationId === '')?.profile ||
      '';

    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 6000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['slides', 'caption'],
            properties: {
              slides: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['heading', 'body'],
                  properties: {
                    heading: { type: 'string' },
                    body: { type: 'string' },
                  },
                },
              },
              caption: { type: 'string' },
            },
          },
        },
      },
      system:
        `You write social media carousels (swipeable image posts) for a small business. Write ` +
        `exactly ${slides} slides: slide 1 is a cover with a short, specific hook as the heading ` +
        '(under 8 words) and a one-line promise as the body; the middle slides each make one ' +
        'point, with a heading under 7 words and a body under 30 words; the last slide is a ' +
        'call to action. Plain words, no emoji in slides, no hashtags in slides. Also write the ' +
        'post caption for the platform, following the brand voice guide when given. Use only ' +
        'facts from the topic; never invent prices, dates or claims.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            platform: (body.platform || 'instagram').split('-')[0],
            brandVoice: voice.slice(0, 4000) || undefined,
            topic: topic.slice(0, 6000),
          }),
        },
      ],
    });
    if (response.stop_reason === 'refusal') {
      throw new BadRequestException('The AI declined this topic');
    }
    const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const parsed = JSON.parse(text) as { slides: { heading: string; body: string }[]; caption: string };
    return {
      slides: parsed.slides.slice(0, 10).map((s) => ({ heading: s.heading.trim(), body: s.body.trim() })),
      caption: parsed.caption.trim(),
    };
  }
}
