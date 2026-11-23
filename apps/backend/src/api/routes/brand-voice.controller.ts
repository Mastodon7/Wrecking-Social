import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { BrandVoiceService } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.service';
import {
  BrandVoiceLearnDto,
  BrandVoiceProfileDto,
  BrandVoiceWriteDto,
} from '@gitroom/nestjs-libraries/dtos/brand-voice/brand-voice.dto';

@ApiTags('Brand voice')
@Controller('/brand-voice')
export class BrandVoiceController {
  constructor(private _brandVoice: BrandVoiceService) {}

  @Get('/')
  list(@GetOrgFromRequest() org: Organization) {
    return this._brandVoice.list(org.id);
  }

  // :integrationId is a channel id, or "default" for all channels
  @Put('/:integrationId')
  save(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Body() body: BrandVoiceProfileDto
  ) {
    return this._brandVoice.save(org.id, integrationId, body.profile || '');
  }

  @Post('/:integrationId/learn')
  learn(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Body() body: BrandVoiceLearnDto
  ) {
    return this._brandVoice.learn(org.id, integrationId, body.notes || '');
  }

  @Post('/write')
  write(@GetOrgFromRequest() org: Organization, @Body() body: BrandVoiceWriteDto) {
    return this._brandVoice.write(org.id, body);
  }
}
