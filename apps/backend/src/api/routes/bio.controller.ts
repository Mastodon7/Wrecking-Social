import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { Response } from 'express';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { BioService } from '@gitroom/nestjs-libraries/database/prisma/bio/bio.service';
import { BioPageDto } from '@gitroom/nestjs-libraries/dtos/bio/bio.dto';

@ApiTags('Link in bio')
@Controller('/bio-pages')
export class BioController {
  constructor(private _bio: BioService) {}

  @Get('/')
  list(@GetOrgFromRequest() org: Organization) {
    return this._bio.list(org.id);
  }

  @Post('/')
  create(@GetOrgFromRequest() org: Organization, @Body() body: BioPageDto) {
    return this._bio.create(org.id, body);
  }

  @Put('/:id')
  update(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: BioPageDto
  ) {
    return this._bio.update(org.id, id, body);
  }

  @Delete('/:id')
  remove(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._bio.remove(org.id, id);
  }

  @Get('/:id/stats')
  stats(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._bio.stats(org.id, id);
  }
}

// No sign-in: the public page's data and the click redirect
@ApiTags('Link in bio (public)')
@Controller('/public/bio')
export class PublicBioController {
  constructor(private _bio: BioService) {}

  @Get('/:slug')
  page(@Param('slug') slug: string, @Query('view') view?: string) {
    return this._bio.publicPage(slug, view === '1');
  }

  @Get('/:slug/go/:linkId')
  async go(
    @Param('slug') slug: string,
    @Param('linkId') linkId: string,
    @Res() res: Response
  ) {
    try {
      res.redirect(302, await this._bio.go(slug, linkId));
    } catch {
      res.status(404).send('Link not found');
    }
  }
}
