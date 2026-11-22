import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { LinkToolsService } from '@gitroom/nestjs-libraries/database/prisma/link-tools/link-tools.service';
import {
  HashtagGroupDto,
  LinkTrackingDto,
} from '@gitroom/nestjs-libraries/dtos/link-tools/link-tools.dto';

@ApiTags('Link tools')
@Controller('/link-tools')
export class LinkToolsController {
  constructor(private _linkToolsService: LinkToolsService) {}

  @Get('/utm')
  getTracking(@GetOrgFromRequest() org: Organization) {
    return this._linkToolsService.getTracking(org.id);
  }

  @Post('/utm')
  async saveTracking(
    @GetOrgFromRequest() org: Organization,
    @Body() body: LinkTrackingDto
  ) {
    await this._linkToolsService.saveTracking(org.id, body);
    return this._linkToolsService.getTracking(org.id);
  }

  @Get('/hashtags')
  listHashtagGroups(@GetOrgFromRequest() org: Organization) {
    return this._linkToolsService.listHashtagGroups(org.id);
  }

  @Post('/hashtags')
  createHashtagGroup(
    @GetOrgFromRequest() org: Organization,
    @Body() body: HashtagGroupDto
  ) {
    return this._linkToolsService.createHashtagGroup(org.id, body);
  }

  @Put('/hashtags/:id')
  updateHashtagGroup(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: HashtagGroupDto
  ) {
    return this._linkToolsService.updateHashtagGroup(org.id, id, body);
  }

  @Delete('/hashtags/:id')
  deleteHashtagGroup(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._linkToolsService.deleteHashtagGroup(org.id, id);
  }
}
