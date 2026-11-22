import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

export type MetricValues = {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
};

@Injectable()
export class InsightsRepository {
  constructor(
    private _metrics: PrismaRepository<'postMetricSnapshot'>,
    private _posts: PrismaRepository<'post'>,
    private _integrations: PrismaRepository<'integration'>
  ) {}

  // YouTube API data may be kept for 30 days only, so older daily rows of
  // Google channels are erased (the newest one is refreshed every day while
  // the post is measured)
  async purgeExpired(providers: string[], olderThan: Date) {
    const integrations = await this._integrations.model.integration.findMany({
      where: { providerIdentifier: { in: providers } },
      select: { id: true },
    });
    if (!integrations.length) {
      return 0;
    }
    const { count } = await this._metrics.model.postMetricSnapshot.deleteMany({
      where: {
        integrationId: { in: integrations.map((i) => i.id) },
        day: { lt: olderThan },
      },
    });
    return count;
  }

  // Published top-level posts that have a platform id, newest first. Comments
  // and thread replies (parentPostId) are measured with their parent post.
  postsToMeasure(since: Date, limit: number) {
    return this._posts.model.post.findMany({
      where: {
        state: 'PUBLISHED',
        deletedAt: null,
        parentPostId: null,
        publishDate: { gte: since },
        releaseId: { not: null },
        integration: {
          deletedAt: null,
          disabled: false,
          refreshNeeded: false,
        },
      },
      select: {
        id: true,
        organizationId: true,
        integrationId: true,
        releaseId: true,
      },
      orderBy: { publishDate: 'desc' },
      take: limit,
    });
  }

  async measuredOn(day: Date, postIds: string[]) {
    const rows = await this._metrics.model.postMetricSnapshot.findMany({
      where: { day, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(rows.map((r) => r.postId));
  }

  saveSnapshot(data: {
    organizationId: string;
    integrationId: string;
    postId: string;
    day: Date;
    values: MetricValues;
    raw: Record<string, number>;
  }) {
    const fields = {
      ...data.values,
      raw: data.raw as Prisma.InputJsonValue,
    };
    return this._metrics.model.postMetricSnapshot.upsert({
      where: { postId_day: { postId: data.postId, day: data.day } },
      create: {
        organizationId: data.organizationId,
        integrationId: data.integrationId,
        postId: data.postId,
        day: data.day,
        ...fields,
      },
      update: fields,
    });
  }

  // The newest snapshot of every post of the organization measured since
  // `since`, with the post and its channel
  async latestSnapshots(organizationId: string, since: Date) {
    const snapshots = await this._metrics.model.postMetricSnapshot.findMany({
      where: { organizationId, day: { gte: since } },
      orderBy: { day: 'desc' },
    });

    const latest = new Map<string, (typeof snapshots)[number]>();
    for (const snapshot of snapshots) {
      if (!latest.has(snapshot.postId)) {
        latest.set(snapshot.postId, snapshot);
      }
    }

    const posts = await this._posts.model.post.findMany({
      where: {
        id: { in: [...latest.keys()] },
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        publishDate: true,
        image: true,
        releaseURL: true,
        integration: {
          select: {
            id: true,
            name: true,
            picture: true,
            providerIdentifier: true,
          },
        },
      },
    });

    return posts.map((post) => ({ post, snapshot: latest.get(post.id)! }));
  }

  async collectionStart(organizationId: string) {
    const first = await this._metrics.model.postMetricSnapshot.findFirst({
      where: { organizationId },
      orderBy: { day: 'asc' },
      select: { day: true },
    });
    return first?.day || null;
  }
}
