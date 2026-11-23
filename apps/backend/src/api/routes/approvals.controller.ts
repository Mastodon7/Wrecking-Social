import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization, User } from '@prisma/client';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { GetUserFromRequest } from '@gitroom/nestjs-libraries/user/user.from.request';
import { ApprovalsService } from '@gitroom/nestjs-libraries/database/prisma/approvals/approvals.service';

class ApprovalSettingDto {
  @IsBoolean()
  required: boolean;
}

class RequestChangesDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

// the signed-in person's role in the current organization
export const roleIn = (org: Organization) =>
  ((org as any)?.users?.[0]?.role as 'USER' | 'ADMIN' | 'SUPERADMIN') || 'USER';

@ApiTags('Approvals')
@Controller('/approvals')
export class ApprovalsController {
  constructor(private _approvals: ApprovalsService) {}

  @Get('/')
  list(@GetOrgFromRequest() org: Organization) {
    return this._approvals.list(org.id);
  }

  @Get('/setting')
  async setting(@GetOrgFromRequest() org: Organization) {
    return {
      required: await this._approvals.isRequired(org.id),
      canApprove: roleIn(org) !== 'USER',
    };
  }

  @Post('/setting')
  saveSetting(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ApprovalSettingDto
  ) {
    if (roleIn(org) === 'USER') {
      throw new ForbiddenException('Only admins can change approval settings');
    }
    return this._approvals.saveSetting(org.id, !!body.required);
  }

  @Get('/group/:group')
  byGroup(@GetOrgFromRequest() org: Organization, @Param('group') group: string) {
    return this._approvals.byGroup(org.id, group);
  }

  @Post('/group/:group/request-changes')
  requestChanges(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Param('group') group: string,
    @Body() body: RequestChangesDto
  ) {
    if (roleIn(org) === 'USER') {
      throw new ForbiddenException('Only admins can review posts');
    }
    return this._approvals.requestChanges(org.id, user, group, body.note || '');
  }
}
