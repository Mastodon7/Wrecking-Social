import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { ReportsService } from '@gitroom/nestjs-libraries/database/prisma/reports/reports.service';

@Injectable()
@Activity()
export class ReportsActivity {
  constructor(private _reportsService: ReportsService) {}

  // Emails last month's report to organizations that asked for it
  @ActivityMethod()
  async sendMonthlyReports() {
    return this._reportsService.sendMonthly();
  }
}
