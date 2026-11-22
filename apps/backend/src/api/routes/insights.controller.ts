import {
  Controller,
  Get,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { InsightsService } from '@gitroom/nestjs-libraries/database/prisma/insights/insights.service';

@ApiTags('Insights')
@Controller('/insights')
export class InsightsController {
  constructor(private _insightsService: InsightsService) {}

  @Get('/')
  async getInsights(
    @GetOrgFromRequest() org: Organization,
    @Query('days') days: string,
    @Query('tz') tz: string
  ) {
    return {
      ...(await this._insightsService.getInsights(org.id, +days, tz)),
      aiConfigured: this._insightsService.aiConfigured(),
    };
  }

  @Get('/ai')
  async getAiSummary(
    @GetOrgFromRequest() org: Organization,
    @Query('days') days: string,
    @Query('tz') tz: string
  ) {
    return this._insightsService.getAiStatus(org.id, +days, tz);
  }

  @Post('/ai')
  async generateAiSummary(
    @GetOrgFromRequest() org: Organization,
    @Query('days') days: string,
    @Query('tz') tz: string
  ) {
    if (!this._insightsService.aiConfigured()) {
      throw new HttpException(
        { message: 'The AI assistant is not set up on this server' },
        503
      );
    }

    // The analysis can take longer than a proxy waits for a response, so it
    // runs in the background and the page polls GET /insights/ai
    return this._insightsService.startAiSummary(org.id, +days, tz);
  }
}
