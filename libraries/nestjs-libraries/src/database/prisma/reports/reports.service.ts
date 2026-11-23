import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { randomBytes } from 'node:crypto';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { InsightsRepository } from '@gitroom/nestjs-libraries/database/prisma/insights/insights.repository';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import {
  GenerateReportDto,
  ReportSettingDto,
} from '@gitroom/nestjs-libraries/dtos/reports/reports.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

// Statistics from Google APIs are kept 30 days at most (privacy policy),
// so they never go into a stored report
const GOOGLE_PROVIDERS = ['youtube', 'gmb'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const validZone = (tz?: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz || 'UTC' });
    return tz || 'UTC';
  } catch {
    return 'UTC';
  }
};
const emailList = (value: string) =>
  [
    ...new Set(
      (value || '')
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
    ),
  ].slice(0, 10);
const escapeHtml = (text: string) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type Totals = {
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
};

@Injectable()
export class ReportsService {
  constructor(
    private _setting: PrismaRepository<'reportSetting'>,
    private _report: PrismaRepository<'report'>,
    private _insightsRepository: InsightsRepository,
    private _notificationService: NotificationService
  ) {}

  async getSetting(organizationId: string) {
    const row = await this._setting.model.reportSetting.findUnique({ where: { organizationId } });
    return {
      brandName: row?.brandName || '',
      logoUrl: row?.logoUrl || '',
      accent: row?.accent || '#086b31',
      timezone: row?.timezone || 'UTC',
      recipients: row?.recipients || '',
      monthlyEmail: row?.monthlyEmail || false,
    };
  }

  async saveSetting(organizationId: string, body: ReportSettingDto) {
    const data = {
      brandName: body.brandName.trim(),
      logoUrl: body.logoUrl && /^https?:\/\//i.test(body.logoUrl.trim()) ? body.logoUrl.trim() : null,
      accent: body.accent,
      timezone: validZone(body.timezone),
      recipients: emailList(body.recipients).join(', '),
      monthlyEmail: !!body.monthlyEmail,
    };
    await this._setting.model.reportSetting.upsert({
      where: { organizationId },
      update: data,
      create: { organizationId, ...data },
    });
    return this.getSetting(organizationId);
  }

  // Numbers of the posts published in one month (in the brand's time zone),
  // from the latest daily snapshot of each post
  private async measure(organizationId: string, month: string, tz: string) {
    const start = dayjs.tz(`${month}-01 00:00`, tz);
    const end = start.add(1, 'month');
    const rows = await this._insightsRepository.latestSnapshots(organizationId, start.toDate());
    const posts = rows
      .filter(
        ({ post }) =>
          !GOOGLE_PROVIDERS.includes(post.integration.providerIdentifier) &&
          !dayjs(post.publishDate).isBefore(start) &&
          dayjs(post.publishDate).isBefore(end)
      )
      .map(({ post, snapshot }) => {
        const engagement =
          (snapshot.likes || 0) + (snapshot.comments || 0) + (snapshot.shares || 0) + (snapshot.saves || 0);
        return {
          text: stripHtmlValidation('none', post.content || '', false).replace(/\s+/g, ' ').trim(),
          platform: post.integration.providerIdentifier.split('-')[0],
          channel: post.integration.name,
          picture: post.integration.picture,
          date: post.publishDate.toISOString(),
          weekday: dayjs(post.publishDate).tz(tz).day(),
          url: post.releaseURL,
          views: snapshot.views || 0,
          likes: snapshot.likes || 0,
          comments: snapshot.comments || 0,
          shares: snapshot.shares || 0,
          saves: snapshot.saves || 0,
          engagement,
        };
      });
    const totals: Totals = {
      posts: posts.length,
      views: posts.reduce((a, p) => a + p.views, 0),
      likes: posts.reduce((a, p) => a + p.likes, 0),
      comments: posts.reduce((a, p) => a + p.comments, 0),
      shares: posts.reduce((a, p) => a + p.shares, 0),
      saves: posts.reduce((a, p) => a + p.saves, 0),
      engagement: posts.reduce((a, p) => a + p.engagement, 0),
    };
    return { posts, totals, start, end };
  }

  async generate(organizationId: string, body: GenerateReportDto, auto = false) {
    const setting = await this.getSetting(organizationId);
    const tz = validZone(setting.timezone);
    const current = await this.measure(organizationId, body.month, tz);
    if (!current.start.isBefore(dayjs())) {
      throw new BadRequestException('That month has not started yet');
    }
    const previousMonth = current.start.subtract(1, 'month').format('YYYY-MM');
    const previous = await this.measure(organizationId, previousMonth, tz);

    const platforms = new Map<string, { posts: number; views: number; engagement: number }>();
    for (const p of current.posts) {
      const row = platforms.get(p.platform) || { posts: 0, views: 0, engagement: 0 };
      row.posts++;
      row.views += p.views;
      row.engagement += p.engagement;
      platforms.set(p.platform, row);
    }
    const weekdays = WEEKDAYS.map((name, day) => {
      const list = current.posts.filter((p) => p.weekday === day);
      return {
        day: name,
        posts: list.length,
        avgEngagement: list.length ? list.reduce((a, p) => a + p.engagement, 0) / list.length : 0,
      };
    });
    const bestDay = [...weekdays].filter((w) => w.posts >= 2).sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

    const data = {
      month: body.month,
      label: current.start.format('MMMM YYYY'),
      timezone: tz,
      brand: { name: setting.brandName, logoUrl: setting.logoUrl, accent: setting.accent },
      totals: current.totals,
      previous: previous.totals,
      byPlatform: [...platforms.entries()]
        .map(([platform, v]) => ({ platform, ...v }))
        .sort((a, b) => b.engagement - a.engagement),
      topPosts: [...current.posts]
        .sort((a, b) => b.engagement - a.engagement || b.views - a.views)
        .slice(0, 5)
        .map(({ weekday, ...p }) => ({ ...p, text: p.text.slice(0, 280) })),
      bestDay: bestDay ? { day: bestDay.day, posts: bestDay.posts } : null,
      note:
        'YouTube and Google Business Profile numbers are not included in saved reports, because Google statistics are kept for 30 days at most.',
      generatedAt: new Date().toISOString(),
    };

    const report = await this._report.model.report.create({
      data: {
        organizationId,
        month: body.month,
        auto,
        token: randomBytes(18).toString('base64url'),
        data,
      },
    });
    return { id: report.id, token: report.token, month: report.month, data };
  }

  list(organizationId: string) {
    return this._report.model.report.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, token: true, month: true, auto: true, createdAt: true },
    });
  }

  async get(organizationId: string, id: string) {
    const report = await this._report.model.report.findFirst({ where: { id, organizationId } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async remove(organizationId: string, id: string) {
    await this.get(organizationId, id);
    return this._report.model.report.delete({ where: { id } });
  }

  async byToken(token: string) {
    if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) throw new NotFoundException();
    const report = await this._report.model.report.findUnique({ where: { token } });
    if (!report) throw new NotFoundException();
    return report.data;
  }

  // On the first days of a month, each organization that asked for it gets
  // last month's report emailed once
  async sendMonthly() {
    const settings = await this._setting.model.reportSetting.findMany({
      where: { monthlyEmail: true },
    });
    let sent = 0;
    for (const setting of settings) {
      const recipients = emailList(setting.recipients);
      if (!recipients.length) continue;
      const tz = validZone(setting.timezone);
      const now = dayjs().tz(tz);
      if (now.date() > 3) continue;
      const month = now.subtract(1, 'month').format('YYYY-MM');
      const exists = await this._report.model.report.findFirst({
        where: { organizationId: setting.organizationId, month, auto: true },
      });
      if (exists) continue;
      try {
        const report = await this.generate(setting.organizationId, { month }, true);
        const url = `${process.env.FRONTEND_URL}/r/${report.token}`;
        const t = report.data.totals;
        const brand = escapeHtml(setting.brandName || 'Your');
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:560px">
            <h2 style="color:${setting.accent}">${brand} social media report: ${escapeHtml(report.data.label)}</h2>
            <p>${t.posts} posts · ${t.views.toLocaleString('en-US')} views · ${t.engagement.toLocaleString('en-US')} engagements
            (${t.likes} likes, ${t.comments} comments, ${t.shares} shares).</p>
            <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:${setting.accent};color:#fff;text-decoration:none;border-radius:6px">Open the full report</a></p>
            <p style="color:#777;font-size:12px">Sent by Wrecking Social. Anyone with this link can view the report.</p>
          </div>`;
        for (const to of recipients) {
          await this._notificationService.sendEmail(
            to,
            `${setting.brandName || 'Social media'} report: ${report.data.label}`,
            html
          );
        }
        sent++;
      } catch (e) {
        console.log(`reports: monthly report for ${setting.organizationId} failed`, e);
      }
    }
    return { sent };
  }
}
