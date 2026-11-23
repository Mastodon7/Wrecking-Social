import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';

type Person = { id: string; name?: string | null; lastName?: string | null; email: string };

const nameOf = (user?: Person | null) =>
  !user
    ? 'Someone'
    : [user.name, user.lastName].filter(Boolean).join(' ').trim() ||
      user.email.split('@')[0];

@Injectable()
export class ApprovalsService {
  constructor(
    private _setting: PrismaRepository<'approvalSetting'>,
    private _approval: PrismaRepository<'postApproval'>,
    private _post: PrismaRepository<'post'>,
    private _user: PrismaRepository<'user'>,
    private _notificationService: NotificationService
  ) {}

  async isRequired(organizationId: string) {
    const row = await this._setting.model.approvalSetting.findUnique({
      where: { organizationId },
    });
    return !!row?.required;
  }

  async saveSetting(organizationId: string, required: boolean) {
    await this._setting.model.approvalSetting.upsert({
      where: { organizationId },
      update: { required },
      create: { organizationId, required },
    });
    return { required };
  }

  // A member saved posts as drafts and asked for approval
  async submit(organizationId: string, user: Person, groups: string[]) {
    const unique = [...new Set(groups.filter(Boolean))];
    if (!unique.length) return;
    for (const group of unique) {
      await this._approval.model.postApproval.upsert({
        where: { organizationId_group: { organizationId, group } },
        update: { status: 'PENDING', submittedById: user.id, decidedById: null, note: null },
        create: { organizationId, group, status: 'PENDING', submittedById: user.id },
      });
    }
    await this._notificationService.inAppNotification(
      organizationId,
      'A post is waiting for approval',
      `${nameOf(user)} submitted a post for approval. Open the calendar and click "Awaiting approval" to review it.`,
      true
    );
  }

  // An admin scheduled or posted these groups: that is the approval
  async approve(organizationId: string, userId: string, groups: string[]) {
    const unique = [...new Set(groups.filter(Boolean))];
    if (!unique.length) return;
    await this._approval.model.postApproval.updateMany({
      where: {
        organizationId,
        group: { in: unique },
        status: { in: ['PENDING', 'CHANGES_REQUESTED'] },
      },
      data: { status: 'APPROVED', decidedById: userId },
    });
  }

  async requestChanges(organizationId: string, user: Person, group: string, note: string) {
    const approval = await this._approval.model.postApproval.findUnique({
      where: { organizationId_group: { organizationId, group } },
    });
    if (!approval) {
      throw new BadRequestException('This post was not submitted for approval');
    }
    await this._approval.model.postApproval.update({
      where: { id: approval.id },
      data: { status: 'CHANGES_REQUESTED', decidedById: user.id, note: note.trim() || null },
    });
    await this._notificationService.inAppNotification(
      organizationId,
      'Changes requested on a post',
      `${nameOf(user)} asked for changes on a post${note.trim() ? `: "${note.trim().slice(0, 300)}"` : ''}. Open the post from the calendar, edit it and submit it again.`,
      true
    );
    return { status: 'CHANGES_REQUESTED' };
  }

  private async people(ids: string[]) {
    const users = await this._user.model.user.findMany({
      where: { id: { in: [...new Set(ids.filter(Boolean))] } },
      select: { id: true, name: true, lastName: true, email: true },
    });
    return new Map(users.map((u) => [u.id, nameOf(u)]));
  }

  async byGroup(organizationId: string, group: string) {
    const approval = await this._approval.model.postApproval.findUnique({
      where: { organizationId_group: { organizationId, group } },
    });
    const required = await this.isRequired(organizationId);
    if (!approval) {
      return { required, status: null as string | null };
    }
    const names = await this.people([approval.submittedById, approval.decidedById || '']);
    return {
      required,
      status: approval.status,
      note: approval.note,
      submittedBy: names.get(approval.submittedById) || 'Someone',
      decidedBy: approval.decidedById ? names.get(approval.decidedById) : null,
      updatedAt: approval.updatedAt,
    };
  }

  // Posts waiting for a decision (or sent back), with what the reviewer
  // needs to pick one: preview, channels, date, who submitted it
  async list(organizationId: string) {
    const approvals = await this._approval.model.postApproval.findMany({
      where: { organizationId, status: { in: ['PENDING', 'CHANGES_REQUESTED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    if (!approvals.length) {
      return { required: await this.isRequired(organizationId), items: [] };
    }
    const posts = await this._post.model.post.findMany({
      where: {
        organizationId,
        group: { in: approvals.map((a) => a.group) },
        deletedAt: null,
        parentPostId: null,
      },
      select: {
        id: true,
        group: true,
        content: true,
        publishDate: true,
        state: true,
        integration: {
          select: { id: true, name: true, picture: true, providerIdentifier: true },
        },
      },
    });
    const names = await this.people(approvals.map((a) => a.submittedById));

    const items = approvals
      .map((approval) => {
        const groupPosts = posts.filter((p) => p.group === approval.group);
        if (!groupPosts.length) return null;
        const first = groupPosts[0];
        const preview = stripHtmlValidation('none', first.content || '', false)
          .replace(/\s+/g, ' ')
          .trim();
        return {
          group: approval.group,
          status: approval.status,
          note: approval.note,
          submittedBy: names.get(approval.submittedById) || 'Someone',
          updatedAt: approval.updatedAt,
          post: {
            id: first.id,
            group: first.group,
            publishDate: first.publishDate,
            state: first.state,
            integration: first.integration.id,
          },
          preview: preview.length > 160 ? preview.slice(0, 157) + '…' : preview,
          channels: groupPosts.map((p) => p.integration),
        };
      })
      .filter(Boolean);

    return { required: await this.isRequired(organizationId), items };
  }
}
