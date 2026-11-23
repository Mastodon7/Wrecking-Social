import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { ReportsService } from '@gitroom/nestjs-libraries/database/prisma/reports/reports.service';
import {
  GenerateReportDto,
  ReportSettingDto,
} from '@gitroom/nestjs-libraries/dtos/reports/reports.dto';

@ApiTags('Reports')
@Controller('/reports')
export class ReportsController {
  constructor(private _reports: ReportsService) {}

  @Get('/settings')
  getSetting(@GetOrgFromRequest() org: Organization) {
    return this._reports.getSetting(org.id);
  }

  @Post('/settings')
  saveSetting(@GetOrgFromRequest() org: Organization, @Body() body: ReportSettingDto) {
    return this._reports.saveSetting(org.id, body);
  }

  @Get('/')
  list(@GetOrgFromRequest() org: Organization) {
    return this._reports.list(org.id);
  }

  @Post('/')
  generate(@GetOrgFromRequest() org: Organization, @Body() body: GenerateReportDto) {
    return this._reports.generate(org.id, body);
  }

  @Get('/:id')
  get(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._reports.get(org.id, id);
  }

  @Delete('/:id')
  remove(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._reports.remove(org.id, id);
  }
}

// No sign-in: a shared report, by its unguessable token
@ApiTags('Reports (public)')
@Controller('/public/reports')
export class PublicReportsController {
  constructor(private _reports: ReportsService) {}

  @Get('/:token')
  byToken(@Param('token') token: string) {
    return this._reports.byToken(token);
  }
}
