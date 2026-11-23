import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { BioPageDto } from '@gitroom/nestjs-libraries/dtos/bio/bio.dto';
import {
  normalizeDomains,
  tagUrl,
} from '@gitroom/nestjs-libraries/database/prisma/link-tools/link-tools.service';

type BioLink = { id: string; label: string; url: string };

const RESERVED = new Set([
  'admin', 'api', 'app', 'auth', 'login', 'www', 'help', 'support', 'wrecking-social',
  'wreckingsocial', 'settings', 'billing', 'static', 'public',
]);

const safeUrl = (value?: string | null) =>
  value && /^https?:\/\//i.test(value.trim()) ? value.trim() : null;

@Injectable()
export class BioService {
  constructor(
    private _page: PrismaRepository<'bioPage'>,
    private _stat: PrismaRepository<'bioStat'>,
    private _linkTracking: PrismaRepository<'linkTracking'>
  ) {}

  list(organizationId: string) {
    return this._page.model.bioPage.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private data(body: BioPageDto) {
    if (RESERVED.has(body.slug)) {
      throw new BadRequestException('That address is reserved, pick another one');
    }
    return {
      slug: body.slug,
      title: body.title.trim() || body.slug,
      bio: (body.bio || '').trim(),
      avatarUrl: safeUrl(body.avatarUrl),
      accent: body.accent || '#086b31',
      links: body.links
        .filter((l) => l.label.trim() && safeUrl(l.url))
        .map((l) => ({ id: l.id, label: l.label.trim(), url: l.url.trim() })),
      published: body.published ?? true,
    };
  }

  private async slugFree(slug: string, exceptId?: string) {
    const taken = await this._page.model.bioPage.findUnique({ where: { slug } });
    if (taken && taken.id !== exceptId) {
      throw new BadRequestException('That address is already taken');
    }
  }

  async create(organizationId: string, body: BioPageDto) {
    const data = this.data(body);
    await this.slugFree(data.slug);
    return this._page.model.bioPage.create({ data: { organizationId, ...data } });
  }

  async update(organizationId: string, id: string, body: BioPageDto) {
    const page = await this._page.model.bioPage.findFirst({ where: { id, organizationId } });
    if (!page) throw new NotFoundException('Page not found');
    const data = this.data(body);
    await this.slugFree(data.slug, id);
    return this._page.model.bioPage.update({ where: { id }, data });
  }

  async remove(organizationId: string, id: string) {
    const page = await this._page.model.bioPage.findFirst({ where: { id, organizationId } });
    if (!page) throw new NotFoundException('Page not found');
    return this._page.model.bioPage.delete({ where: { id } });
  }

  // Views and clicks per link over the last 30 days
  async stats(organizationId: string, id: string) {
    const page = await this._page.model.bioPage.findFirst({ where: { id, organizationId } });
    if (!page) throw new NotFoundException('Page not found');
    const rows = await this._stat.model.bioStat.findMany({
      where: { pageId: id, day: { gte: dayjs().subtract(30, 'day').startOf('day').toDate() } },
    });
    const total = (linkId: string) =>
      rows.filter((r) => r.linkId === linkId).reduce((a, r) => a + r.count, 0);
    return {
      views: total('_view'),
      links: ((page.links as BioLink[]) || []).map((l) => ({
        id: l.id,
        label: l.label,
        clicks: total(l.id),
      })),
    };
  }

  private async bump(pageId: string, linkId: string) {
    const day = dayjs().utc().startOf('day').toDate();
    await this._stat.model.bioStat.upsert({
      where: { pageId_linkId_day: { pageId, linkId, day } },
      update: { count: { increment: 1 } },
      create: { pageId, linkId, day, count: 1 },
    });
  }

  // ---- public ------------------------------------------------------------

  async publicPage(slug: string, countView: boolean) {
    const page = await this._page.model.bioPage.findUnique({ where: { slug } });
    if (!page || !page.published) throw new NotFoundException();
    if (countView) {
      await this.bump(page.id, '_view').catch(() => undefined);
    }
    return {
      slug: page.slug,
      title: page.title,
      bio: page.bio,
      avatarUrl: page.avatarUrl,
      accent: page.accent,
      links: ((page.links as BioLink[]) || []).map((l) => ({ id: l.id, label: l.label })),
    };
  }

  // Where a click goes: the link's address, with UTM tags when link
  // tracking is on for that domain. Counted per day, nothing about the
  // visitor is kept.
  async go(slug: string, linkId: string) {
    const page = await this._page.model.bioPage.findUnique({ where: { slug } });
    const link = ((page?.links as BioLink[]) || []).find((l) => l.id === linkId);
    if (!page || !page.published || !link || !safeUrl(link.url)) {
      throw new NotFoundException();
    }
    await this.bump(page.id, link.id).catch(() => undefined);
    const tracking = await this._linkTracking.model.linkTracking.findUnique({
      where: { organizationId: page.organizationId },
    });
    if (!tracking?.enabled) return link.url;
    return tagUrl(
      link.url,
      normalizeDomains(tracking.domains),
      'link-in-bio',
      tracking.medium || 'social',
      tracking.campaign || 'wrecking-social'
    );
  }
}
