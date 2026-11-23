import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { ContentToolsService } from '@gitroom/nestjs-libraries/database/prisma/content-tools/content-tools.service';
import {
  CreateDraftsDto,
  RepurposeDto,
} from '@gitroom/nestjs-libraries/dtos/content-tools/content-tools.dto';

@ApiTags('Content tools')
@Controller('/content-tools')
export class ContentToolsController {
  constructor(private _contentTools: ContentToolsService) {}

  @Get('/status')
  status() {
    return {
      aiConfigured: this._contentTools.aiConfigured(),
      transcriptionConfigured: this._contentTools.transcriptionConfigured(),
    };
  }

  @Post('/drafts')
  createDrafts(
    @GetOrgFromRequest() org: Organization,
    @Body() body: CreateDraftsDto
  ) {
    return this._contentTools.createDrafts(org.id, body.items);
  }

  @Post('/repurpose')
  repurpose(@GetOrgFromRequest() org: Organization, @Body() body: RepurposeDto) {
    return this._contentTools.repurpose(org.id, body);
  }

  @Post('/transcribe')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  transcribe(
    @GetOrgFromRequest() org: Organization,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this._contentTools.transcribe(org.id, file);
  }
}
