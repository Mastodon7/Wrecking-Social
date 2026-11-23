import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

@Injectable()
export class LinkToolsRepository {
  constructor(
    private _linkTracking: PrismaRepository<'linkTracking'>,
    private _hashtagGroup: PrismaRepository<'hashtagGroup'>
  ) {}

  getTracking(organizationId: string) {
    return this._linkTracking.model.linkTracking.findUnique({
      where: { organizationId },
    });
  }

  saveTracking(
    organizationId: string,
    data: { enabled: boolean; domains: string; medium: string; campaign: string }
  ) {
    return this._linkTracking.model.linkTracking.upsert({
      where: { organizationId },
      update: data,
      create: { organizationId, ...data },
    });
  }

  listHashtagGroups(organizationId: string) {
    return this._hashtagGroup.model.hashtagGroup.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, tags: true },
    });
  }

  createHashtagGroup(organizationId: string, name: string, tags: string) {
    return this._hashtagGroup.model.hashtagGroup.create({
      data: { organizationId, name, tags },
      select: { id: true, name: true, tags: true },
    });
  }

  updateHashtagGroup(organizationId: string, id: string, name: string, tags: string) {
    return this._hashtagGroup.model.hashtagGroup.updateMany({
      where: { id, organizationId, deletedAt: null },
      data: { name, tags },
    });
  }

  deleteHashtagGroup(organizationId: string, id: string) {
    return this._hashtagGroup.model.hashtagGroup.updateMany({
      where: { id, organizationId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
