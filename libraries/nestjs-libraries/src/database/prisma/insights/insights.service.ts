import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Anthropic from '@anthropic-ai/sdk';
import {
  InsightsRepository,
  MetricValues,
} from '@gitroom/nestjs-libraries/database/prisma/insights/insights.repository';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { AnalyticsData } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { timer } from '@gitroom/helpers/utils/timer';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

dayjs.extend(utc);

// Posts are measured every day for this long after they go out. Most
// engagement arrives in the first days, so this keeps API calls bounded
const MEASURE_DAYS = 60;
// Upper bound of posts measured in one daily run (all organizations)
const MAX_POSTS_PER_RUN = 2000;
// Pause between platform calls, to stay far from rate limits
const PAUSE_MS = 750;

// Statistics from Google APIs are kept 30 days at most and never sent to an
// AI provider (privacy policy, YouTube API Services policies)
const GOOGLE_PROVIDERS = ['youtube', 'gmb'];
const GOOGLE_RETENTION_DAYS = 30;

const AI_MODEL = 'claude-opus-5-5';
const AI_CACHE_SECONDS = 6 * 3600;

// Each platform names its numbers differently; these map them onto the
// columns Insights compares. The first label found wins.
const METRIC_LABELS: Record<keyof MetricValues, string[]> = {
  views: ['Views', 'Impressions', 'Reach'],
  likes: ['Likes', 'Reactions', 'Favorites'],
  comments: ['Comments', 'Replies'],
  shares: ['Shares', 'Reposts', 'Retweets'],
  saves: ['Saves', 'Bookmarks'],
  clicks: ['Clicks', 'Pin Clicks', 'Outbound Clicks'],
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type MediaType = 'video' | 'carousel' | 'image' | 'text';

type MeasuredPost = {
  id: string;
  channel: { id: string; name: string; picture: string | null; provider: string };
  publishDate: string;
  url: string | null;
  text: string;
  mediaType: MediaType;
  hashtags: number;
  length: number;
  views: number | null;
  engagement: number;
  engagementRate: number | null;
  // engagement compared with the channel's average (1 = typical for it), so
  // posts from big and small channels can be compared
  score: number;
  metrics: MetricValues;
  weekday: number;
  hour: number;
};

type Group = { key: string; posts: number; avgScore: number; avgEngagement: number };

@Injectable()
export class InsightsService {
  constructor(
    private _insightsRepository: InsightsRepository,
    private _postsService: PostsService
  ) {}

  // ---- Daily collection --------------------------------------------------

  async collectMetrics() {
    const day = dayjs.utc().startOf('day').toDate();
    await this._insightsRepository.purgeExpired(
      GOOGLE_PROVIDERS,
      dayjs.utc().startOf('day').subtract(GOOGLE_RETENTION_DAYS, 'day').toDate()
    );
    const posts = await this._insightsRepository.postsToMeasure(
      dayjs().subtract(MEASURE_DAYS, 'day').toDate(),
      MAX_POSTS_PER_RUN
    );
    const done = await this._insightsRepository.measuredOn(
      day,
      posts.map((p) => p.id)
    );

    let saved = 0;
    for (const post of posts) {
      if (done.has(post.id) || post.releaseId === 'missing') {
        continue;
      }

      try {
        const analytics = await this._postsService.checkPostAnalytics(
          post.organizationId,
          post.id,
          MEASURE_DAYS
        );

        if (!Array.isArray(analytics) || !analytics.length) {
          continue;
        }

        const { values, raw } = this.normalize(analytics);
        await this._insightsRepository.saveSnapshot({
          organizationId: post.organizationId,
          integrationId: post.integrationId,
          postId: post.id,
          day,
          values,
          raw,
        });
        saved++;
      } catch (err) {
        console.log(`Insights: could not measure post ${post.id}`, err);
      }

      await timer(PAUSE_MS);
    }

    return { candidates: posts.length, saved };
  }

  normalize(analytics: AnalyticsData[]) {
    const raw: Record<string, number> = {};
    for (const item of analytics) {
      const points = (item?.data || [])
        .map((p) => Number(p.total))
        .filter((n) => Number.isFinite(n));
      if (!item?.label || !points.length) {
        continue;
      }
      // A post's numbers come either as one running total or as one value per
      // day; distinct dates mean a daily series, which adds up
      const dates = new Set((item.data || []).map((p) => p.date));
      raw[item.label] =
        dates.size > 1 ? points.reduce((a, b) => a + b, 0) : points[points.length - 1];
    }

    const values = {} as MetricValues;
    for (const [key, labels] of Object.entries(METRIC_LABELS)) {
      const label = labels.find((l) => raw[l] !== undefined);
      values[key as keyof MetricValues] =
        label !== undefined ? Math.round(raw[label]) : null;
    }

    return { values, raw };
  }

  // ---- Insights ----------------------------------------------------------

  validTimeZone(tz?: string) {
    if (!tz) {
      return 'UTC';
    }
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return tz;
    } catch {
      return 'UTC';
    }
  }

  async getInsights(
    organizationId: string,
    days: number,
    tz?: string,
    excludeProviders: string[] = [],
    integrationIds: string[] = []
  ) {
    const timeZone = this.validTimeZone(tz);
    const period = this.period(days);
    const since = dayjs().subtract(period, 'day');
    const rows = await this._insightsRepository.latestSnapshots(
      organizationId,
      since.toDate()
    );

    const local = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23',
    });

    const measured = rows
      .filter(
        ({ post }) =>
          dayjs(post.publishDate).isAfter(since) &&
          !excludeProviders.includes(post.integration.providerIdentifier) &&
          (!integrationIds.length || integrationIds.includes(post.integration.id))
      )
      .map(({ post, snapshot }) => {
        const metrics: MetricValues = {
          views: snapshot.views,
          likes: snapshot.likes,
          comments: snapshot.comments,
          shares: snapshot.shares,
          saves: snapshot.saves,
          clicks: snapshot.clicks,
        };
        const engagement =
          (metrics.likes || 0) +
          (metrics.comments || 0) +
          (metrics.shares || 0) +
          (metrics.saves || 0);
        const text = stripHtmlValidation('none', post.content || '', false)
          .replace(/\s+/g, ' ')
          .trim();
        const parts = local.formatToParts(post.publishDate);
        const weekday = WEEKDAYS.indexOf(
          parts.find((p) => p.type === 'weekday')?.value || 'Mon'
        );
        const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0) % 24;

        return {
          id: post.id,
          channel: {
            id: post.integration.id,
            name: post.integration.name,
            picture: post.integration.picture,
            provider: post.integration.providerIdentifier,
          },
          publishDate: post.publishDate.toISOString(),
          url: post.releaseURL,
          text,
          mediaType: this.mediaType(post.image),
          hashtags: (text.match(/#[\p{L}\p{N}_]+/gu) || []).length,
          length: text.length,
          views: metrics.views,
          engagement,
          engagementRate:
            metrics.views && metrics.views > 0 ? engagement / metrics.views : null,
          score: 0,
          metrics,
          weekday: weekday < 0 ? 0 : weekday,
          hour,
        } satisfies MeasuredPost;
      });

    // Score each post against its own channel's average engagement
    const channelAverage = new Map<string, number>();
    for (const [channelId, posts] of this.groupBy(measured, (p) => p.channel.id)) {
      channelAverage.set(
        channelId,
        posts.reduce((a, p) => a + p.engagement, 0) / posts.length
      );
    }
    for (const post of measured) {
      const average = channelAverage.get(post.channel.id) || 0;
      post.score = average > 0 ? post.engagement / average : 0;
    }

    const heatmap = WEEKDAYS.map((_, weekday) =>
      Array.from({ length: 24 }, (_, hour) => {
        const cell = measured.filter((p) => p.weekday === weekday && p.hour === hour);
        return {
          posts: cell.length,
          avgScore: cell.length ? this.average(cell.map((p) => p.score)) : null,
        };
      })
    );

    const byScore = [...measured].sort((a, b) => b.score - a.score);

    return {
      timeZone,
      days: period,
      collectingSince: await this._insightsRepository.collectionStart(organizationId),
      totals: {
        posts: measured.length,
        views: measured.reduce((a, p) => a + (p.views || 0), 0),
        engagement: measured.reduce((a, p) => a + p.engagement, 0),
        likes: measured.reduce((a, p) => a + (p.metrics.likes || 0), 0),
        comments: measured.reduce((a, p) => a + (p.metrics.comments || 0), 0),
        shares: measured.reduce((a, p) => a + (p.metrics.shares || 0), 0),
        saves: measured.reduce((a, p) => a + (p.metrics.saves || 0), 0),
      },
      heatmap,
      bestTimes: this.bestTimes(measured),
      byPlatform: this.groups(measured, (p) => p.channel.provider),
      byWeekday: this.groups(measured, (p) => WEEKDAYS[p.weekday]),
      byMediaType: this.groups(measured, (p) => p.mediaType),
      byLength: this.groups(measured, (p) =>
        p.length < 80 ? 'short (<80)' : p.length < 300 ? 'medium (80-300)' : 'long (300+)'
      ),
      byHashtags: this.groups(measured, (p) =>
        p.hashtags === 0 ? 'none' : p.hashtags <= 3 ? '1-3' : p.hashtags <= 7 ? '4-7' : '8+'
      ),
      topPosts: byScore.slice(0, 5),
      bottomPosts: byScore.length > 5 ? byScore.slice(-5).reverse() : [],
    };
  }

  // The hours that worked best, for the "Best time" button in the composer.
  // It looks at the chosen channels first; with too little data there it
  // falls back to the whole account, then to common defaults. The composer
  // turns each weekday + hour into the next date in the user's timezone.
  async bestTime(organizationId: string, integrationIds: string[], tz?: string) {
    const fromChannels = integrationIds.length
      ? await this.getInsights(organizationId, 90, tz, [], integrationIds)
      : null;
    if (fromChannels && fromChannels.totals.posts >= 6 && fromChannels.bestTimes.length) {
      return {
        basis: 'channels' as const,
        timeZone: fromChannels.timeZone,
        measuredPosts: fromChannels.totals.posts,
        slots: fromChannels.bestTimes.slice(0, 3),
      };
    }

    const fromAccount = await this.getInsights(organizationId, 90, tz);
    if (fromAccount.totals.posts >= 6 && fromAccount.bestTimes.length) {
      return {
        basis: 'account' as const,
        timeZone: fromAccount.timeZone,
        measuredPosts: fromAccount.totals.posts,
        slots: fromAccount.bestTimes.slice(0, 3),
      };
    }

    // Not enough history yet: midweek late morning and early evening are
    // the usual starting points until our own numbers say otherwise
    return {
      basis: 'default' as const,
      timeZone: fromAccount.timeZone,
      measuredPosts: fromAccount.totals.posts,
      slots: [
        { weekday: 'Wed', hour: 11, posts: 0, avgScore: 0 },
        { weekday: 'Tue', hour: 18, posts: 0, avgScore: 0 },
        { weekday: 'Thu', hour: 12, posts: 0, avgScore: 0 },
      ],
    };
  }

  private mediaType(image: string | null): MediaType {
    let media: Array<{ path?: string }> = [];
    try {
      media = JSON.parse(image || '[]') || [];
    } catch {
      media = [];
    }
    if (!Array.isArray(media) || !media.length) {
      return 'text';
    }
    if (media.some((m) => /\.(mp4|mov|m4v|webm|avi)(\?|$)/i.test(m?.path || ''))) {
      return 'video';
    }
    return media.length > 1 ? 'carousel' : 'image';
  }

  // Hour slots (weekday + hour) with at least two posts, best first
  private bestTimes(posts: MeasuredPost[]) {
    return [...this.groupBy(posts, (p) => `${p.weekday}-${p.hour}`)]
      .filter(([, list]) => list.length >= 2)
      .map(([key, list]) => {
        const [weekday, hour] = key.split('-').map(Number);
        return {
          weekday: WEEKDAYS[weekday],
          hour,
          posts: list.length,
          avgScore: this.average(list.map((p) => p.score)),
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }

  private groups(posts: MeasuredPost[], key: (p: MeasuredPost) => string): Group[] {
    return [...this.groupBy(posts, key)]
      .map(([k, list]) => ({
        key: k,
        posts: list.length,
        avgScore: this.average(list.map((p) => p.score)),
        avgEngagement: this.average(list.map((p) => p.engagement)),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }

  private groupBy<T>(list: T[], key: (item: T) => string) {
    const map = new Map<string, T[]>();
    for (const item of list) {
      const k = key(item);
      map.set(k, [...(map.get(k) || []), item]);
    }
    return map;
  }

  private average(values: number[]) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  // ---- AI summary --------------------------------------------------------

  aiConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  private aiCacheKey(organizationId: string, days: number, timeZone: string) {
    return `insights-ai:${organizationId}:${days}:${timeZone}`;
  }

  private period(days: number) {
    return Math.min(Math.max(Math.round(days) || 30, 7), 365);
  }

  // { status: 'none' | 'running' | 'failed' | 'ready', summary? }
  async getAiStatus(organizationId: string, days: number, tz?: string) {
    const key = this.aiCacheKey(organizationId, this.period(days), this.validTimeZone(tz));
    const [cached, state] = await Promise.all([
      ioRedis.get(key),
      ioRedis.get(`${key}:state`),
    ]);
    if (state === 'running' || state === 'failed') {
      return { status: state, summary: cached ? JSON.parse(cached) : null };
    }
    return cached
      ? { status: 'ready', summary: JSON.parse(cached) }
      : { status: 'none', summary: null };
  }

  async startAiSummary(organizationId: string, days: number, tz?: string) {
    const key = this.aiCacheKey(organizationId, this.period(days), this.validTimeZone(tz));
    // a failed attempt can be retried right away
    if ((await ioRedis.get(`${key}:state`)) === 'failed') {
      await ioRedis.del(`${key}:state`);
    }
    // only one analysis at a time per organization and period
    const started = await ioRedis.set(`${key}:state`, 'running', 'EX', 600, 'NX');
    if (started) {
      this.generateAiSummary(organizationId, days, tz)
        .then(() => ioRedis.del(`${key}:state`))
        .catch(async (err) => {
          console.log('Insights AI summary failed', err);
          await ioRedis.set(`${key}:state`, 'failed', 'EX', 300);
        });
    }
    return this.getAiStatus(organizationId, days, tz);
  }

  private async generateAiSummary(organizationId: string, days: number, tz?: string) {
    const insights = await this.getInsights(organizationId, days, tz, GOOGLE_PROVIDERS);
    const cacheKey = this.aiCacheKey(organizationId, insights.days, insights.timeZone);
    if (insights.totals.posts < 3) {
      const summary = {
        notEnoughData: true,
        posts: insights.totals.posts,
        generatedAt: new Date().toISOString(),
      };
      await ioRedis.set(cacheKey, JSON.stringify(summary), 'EX', 600);
      return summary;
    }

    const brief = (p: MeasuredPost) => ({
      platform: p.channel.provider,
      channel: p.channel.name,
      published: `${WEEKDAYS[p.weekday]} ${String(p.hour).padStart(2, '0')}:00`,
      mediaType: p.mediaType,
      hashtags: p.hashtags,
      length: p.length,
      caption: p.text.length > 500 ? `${p.text.slice(0, 500)}…` : p.text,
      views: p.views,
      engagement: p.engagement,
      engagementRate: p.engagementRate,
      score: Number(p.score.toFixed(2)),
      metrics: p.metrics,
    });

    const data = {
      note: 'YouTube and Google Business Profile posts are not included.',
      timeZone: insights.timeZone,
      periodDays: insights.days,
      totals: insights.totals,
      bestTimes: insights.bestTimes,
      byPlatform: insights.byPlatform,
      byWeekday: insights.byWeekday,
      byMediaType: insights.byMediaType,
      byLength: insights.byLength,
      byHashtags: insights.byHashtags,
      topPosts: insights.topPosts.map(brief),
      bottomPosts: insights.bottomPosts.map(brief),
    };

    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['headline', 'findings', 'recommendations', 'bestTimes', 'caveats'],
            properties: {
              headline: { type: 'string' },
              findings: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['title', 'detail'],
                  properties: {
                    title: { type: 'string' },
                    detail: { type: 'string' },
                  },
                },
              },
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['action', 'why'],
                  properties: {
                    action: { type: 'string' },
                    why: { type: 'string' },
                  },
                },
              },
              bestTimes: { type: 'array', items: { type: 'string' } },
              caveats: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      system:
        'You are the analytics assistant inside Wrecking Social, a social media scheduling app. ' +
        'You read engagement data for one business\'s own published posts and explain, in plain ' +
        'English for a busy small-business owner, what gets more engagement and when to post. ' +
        'Base every statement on the numbers given; cite them (for example "3 of your top 5 posts ' +
        'were videos"). "score" compares a post with its own channel\'s average (1.0 = typical, ' +
        '2.0 = twice as much engagement), so posts from different-sized channels are comparable. ' +
        'Times are local to the given time zone. Say when a pattern rests on only a few posts. ' +
        'Write 3 to 6 findings, 3 to 5 concrete recommendations the owner can act on this week, ' +
        'the best posting times as short strings like "Tuesday around 7 PM (Instagram)", and ' +
        'caveats about data limits. Keep each item to one or two sentences. Captions may be ' +
        'shortened to 500 characters.',
      messages: [
        {
          role: 'user',
          content: `Engagement data:\n${JSON.stringify(data)}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('The AI declined to analyze this data');
    }

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    const summary = {
      ...JSON.parse(text),
      posts: insights.totals.posts,
      generatedAt: new Date().toISOString(),
    };

    await ioRedis.set(
      cacheKey,
      JSON.stringify(summary),
      'EX',
      AI_CACHE_SECONDS
    );

    return summary;
  }
}
