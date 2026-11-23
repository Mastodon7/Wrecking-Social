import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { InboxToolsService } from '@gitroom/nestjs-libraries/database/prisma/inbox-tools/inbox-tools.service';
import {
  InboxDraftDto,
  InboxKnowledgeDto,
  InboxStateDto,
  SavedReplyDto,
} from '@gitroom/nestjs-libraries/dtos/inbox-tools/inbox-tools.dto';

@ApiTags('Inbox tools')
@Controller('/inbox-tools')
export class InboxToolsController {
  constructor(private _inboxTools: InboxToolsService) {}

  @Get('/state')
  listStates(@GetOrgFromRequest() org: Organization) {
    return this._inboxTools.listStates(org.id);
  }

  @Post('/state')
  setState(@GetOrgFromRequest() org: Organization, @Body() body: InboxStateDto) {
    return this._inboxTools.setState(org.id, body);
  }

  @Get('/team')
  team(@GetOrgFromRequest() org: Organization) {
    return this._inboxTools.team(org.id);
  }

  @Get('/replies')
  listSavedReplies(@GetOrgFromRequest() org: Organization) {
    return this._inboxTools.listSavedReplies(org.id);
  }

  @Post('/replies')
  createSavedReply(
    @GetOrgFromRequest() org: Organization,
    @Body() body: SavedReplyDto
  ) {
    return this._inboxTools.createSavedReply(org.id, body);
  }

  @Put('/replies/:id')
  updateSavedReply(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: SavedReplyDto
  ) {
    return this._inboxTools.updateSavedReply(org.id, id, body);
  }

  @Delete('/replies/:id')
  deleteSavedReply(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._inboxTools.deleteSavedReply(org.id, id);
  }

  @Get('/knowledge')
  getKnowledge(@GetOrgFromRequest() org: Organization) {
    return this._inboxTools.getKnowledge(org.id);
  }

  @Post('/knowledge')
  saveKnowledge(
    @GetOrgFromRequest() org: Organization,
    @Body() body: InboxKnowledgeDto
  ) {
    return this._inboxTools.saveKnowledge(org.id, body.knowledge || '');
  }

  @Post('/draft')
  draft(@GetOrgFromRequest() org: Organization, @Body() body: InboxDraftDto) {
    return this._inboxTools.draftReply(org.id, body);
  }
}
