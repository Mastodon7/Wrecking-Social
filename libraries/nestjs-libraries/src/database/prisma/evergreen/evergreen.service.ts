import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { randomUUID } from 'node:crypto';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import {
  EvergreenCategoryDto,
  EvergreenItemDto,
} from '@gitroom/nestjs-libraries/dtos/evergreen/evergreen.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

// How far ahead slots are filled; the daily job keeps this window full
const PLAN_DAYS = 7;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textToHtml = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

const validZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
};

@Injectable()
export class EvergreenService {
  constructor(
    private _category: PrismaRepository<'evergreenCategory'>,
    private _item: PrismaRepository<'evergreenItem'>,
    private _run: PrismaRepository<'evergreenRun'>,
    private _integration: PrismaRepository<'integration'>,
    private _approvalSetting: PrismaRepository<'approvalSetting'>,
    private _postsService: PostsService
  ) {}

  // ---- library -------------------------------------------------------------

  async listCategories(organizationId: string) {
    const categories = await this._category.model.evergreenCategory.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { items: { where: { deletedAt: null, active: true } } } },
      },
    });
    return categories.map(({ _count, ...c }) => ({
      ...c,
      days: c.days.split(',').map(Number).filter(Boolean),
      activeItems: _count.items,
    }));
  }

  private async checkChannels(organizationId: string, ids: string[]) {
    const count = await this._integration.model.integration.count({
      where: { organizationId, id: { in: [...new Set(ids)] }, deletedAt: null },
    });
    if (count !== new Set(ids).size) {
      throw new BadRequestException('One of the channels was not found');
    }
  }

  private categoryData(body: EvergreenCategoryDto) {
    return {
      name: body.name.trim() || 'Evergreen',
      days: [...new Set(body.days)].sort().join(','),
      time: body.time,
      timezone: validZone(body.timezone),
      integrationIds: [...new Set(body.integrationIds)],
      ...(body.active !== undefined ? { active: body.active } : {}),
    };
  }

  async createCategory(organizationId: string, body: EvergreenCategoryDto) {
    await this.checkChannels(organizationId, body.integrationIds);
    return this._category.model.evergreenCategory.create({
      data: { organizationId, ...this.categoryData(body) },
    });
  }

  private async ownCategory(organizationId: string, id: string) {
    const category = await this._category.model.evergreenCategory.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(organizationId: string, id: string, body: EvergreenCategoryDto) {
    await this.ownCategory(organizationId, id);
    await this.checkChannels(organizationId, body.integrationIds);
    return this._category.model.evergreenCategory.update({
      where: { id },
      data: this.categoryData(body),
    });
  }

  async deleteCategory(organizationId: string, id: string) {
    await this.ownCategory(organizationId, id);
    return this._category.model.evergreenCategory.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }

  async listItems(organizationId: string, categoryId: string) {
    await this.ownCategory(organizationId, categoryId);
    return this._item.model.evergreenItem.findMany({
      where: { categoryId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, text: true, active: true, useCount: true, lastUsedAt: true },
    });
  }

  async createItem(organizationId: string, categoryId: string, body: EvergreenItemDto) {
    await this.ownCategory(organizationId, categoryId);
    if (!body.text.trim()) throw new BadRequestException('The post text is empty');
    return this._item.model.evergreenItem.create({
      data: { organizationId, categoryId, text: body.text.trim(), active: body.active ?? true },
      select: { id: true, text: true, active: true, useCount: true, lastUsedAt: true },
    });
  }

  async updateItem(organizationId: string, id: string, body: EvergreenItemDto) {
    const item = await this._item.model.evergreenItem.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Post not found');
    return this._item.model.evergreenItem.update({
      where: { id },
      data: {
        ...(body.text?.trim() ? { text: body.text.trim() } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
      select: { id: true, text: true, active: true, useCount: true, lastUsedAt: true },
    });
  }

  async deleteItem(organizationId: string, id: string) {
    const item = await this._item.model.evergreenItem.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Post not found');
    return this._item.model.evergreenItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async upcoming(organizationId: string) {
    const runs = await this._run.model.evergreenRun.findMany({
      where: { organizationId, slot: { gte: new Date() } },
      orderBy: { slot: 'asc' },
      take: 50,
      include: { category: { select: { name: true } } },
    });
    const items = await this._item.model.evergreenItem.findMany({
      where: { id: { in: runs.map((r) => r.itemId) } },
      select: { id: true, text: true },
    });
    return runs.map((r) => ({
      slot: r.slot,
      category: r.category.name,
      asDraft: r.asDraft,
      text: (items.find((i) => i.id === r.itemId)?.text || '').slice(0, 160),
    }));
  }

  // ---- rotation ------------------------------------------------------------

  // The slot instants of a category over the next days, in its time zone
  slots(category: { days: string; time: string; timezone: string }, from = dayjs()) {
    const days = category.days.split(',').map(Number);
    const tz = validZone(category.timezone);
    const result: dayjs.Dayjs[] = [];
    const today = from.tz(tz).format('YYYY-MM-DD');
    for (let d = 0; d < PLAN_DAYS; d++) {
      const date = dayjs.tz(`${today} 00:00`, tz).add(d, 'day');
      // isoWeekday: dayjs day() is 0 = Sunday
      const iso = date.day() === 0 ? 7 : date.day();
      if (!days.includes(iso)) continue;
      const slot = dayjs.tz(`${date.format('YYYY-MM-DD')} ${category.time}`, tz);
      if (slot.isAfter(from.add(30, 'minute'))) result.push(slot);
    }
    return result;
  }

  // Fills every open slot of the next 7 days with the least recently used
  // post of its category. Scheduled when it can be; saved as a draft when
  // approvals are on or a channel needs settings only the editor can give.
  async plan(organizationId?: string) {
    const categories = await this._category.model.evergreenCategory.findMany({
      where: { deletedAt: null, active: true, ...(organizationId ? { organizationId } : {}) },
    });
    let created = 0;
    let drafts = 0;

    for (const category of categories) {
      const channels = await this._integration.model.integration.findMany({
        where: {
          organizationId: category.organizationId,
          id: { in: category.integrationIds },
          deletedAt: null,
          disabled: false,
        },
        select: { id: true },
      });
      if (!channels.length) continue;

      const approvals = await this._approvalSetting.model.approvalSetting.findUnique({
        where: { organizationId: category.organizationId },
      });

      for (const slot of this.slots(category)) {
        const exists = await this._run.model.evergreenRun.findUnique({
          where: { categoryId_slot: { categoryId: category.id, slot: slot.toDate() } },
        });
        if (exists) continue;

        const item = await this._item.model.evergreenItem.findFirst({
          where: { categoryId: category.id, deletedAt: null, active: true },
          orderBy: [{ lastUsedAt: { sort: 'asc', nulls: 'first' } }, { useCount: 'asc' }],
        });
        if (!item) break;

        // claim the slot first, so two runs never fill it twice
        let run;
        try {
          run = await this._run.model.evergreenRun.create({
            data: {
              organizationId: category.organizationId,
              categoryId: category.id,
              slot: slot.toDate(),
              itemId: item.id,
            },
          });
        } catch {
          continue;
        }

        const group = randomUUID();
        const makeBody = (type: 'draft' | 'schedule') => ({
          type,
          shortLink: false,
          date: slot.utc().format('YYYY-MM-DDTHH:mm:ss'),
          tags: [] as { value: string; label: string }[],
          posts: channels.map((c) => ({
            integration: { id: c.id },
            group,
            value: [{ content: textToHtml(item.text), image: [] }],
            settings: {},
          })),
        });

        let asDraft = !!approvals?.required;
        try {
          if (!asDraft) {
            const body = await this._postsService.mapTypeToPost(
              makeBody('schedule') as any,
              category.organizationId
            );
            await this._postsService.createPost(category.organizationId, body, 'AUTOPOST');
          }
        } catch {
          asDraft = true;
        }
        try {
          if (asDraft) {
            const body = await this._postsService.mapTypeToPost(
              makeBody('draft') as any,
              category.organizationId
            );
            await this._postsService.createPost(category.organizationId, body, 'AUTOPOST');
            drafts++;
          }
        } catch (e) {
          // give the slot back so a later run can try again
          await this._run.model.evergreenRun.delete({ where: { id: run.id } });
          console.log(`evergreen: could not fill ${category.id} at ${slot.format()}`, e);
          continue;
        }

        await this._run.model.evergreenRun.update({
          where: { id: run.id },
          data: { postGroup: group, asDraft },
        });
        await this._item.model.evergreenItem.update({
          where: { id: item.id },
          data: { useCount: { increment: 1 }, lastUsedAt: slot.toDate() },
        });
        created++;
      }
    }
    return { created, drafts };
  }
}
