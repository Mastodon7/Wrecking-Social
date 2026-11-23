import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { EvergreenService } from '@gitroom/nestjs-libraries/database/prisma/evergreen/evergreen.service';

@Injectable()
@Activity()
export class EvergreenActivity {
  constructor(private _evergreenService: EvergreenService) {}

  // Fills the next 7 days of evergreen slots for every organization
  @ActivityMethod()
  async planEvergreen() {
    return this._evergreenService.plan();
  }
}
