import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { EvergreenService } from '@gitroom/nestjs-libraries/database/prisma/evergreen/evergreen.service';
import {
  EvergreenCategoryDto,
  EvergreenItemDto,
} from '@gitroom/nestjs-libraries/dtos/evergreen/evergreen.dto';

@ApiTags('Evergreen')
@Controller('/evergreen')
export class EvergreenController {
  constructor(private _evergreen: EvergreenService) {}

  @Get('/categories')
  list(@GetOrgFromRequest() org: Organization) {
    return this._evergreen.listCategories(org.id);
  }

  @Post('/categories')
  create(@GetOrgFromRequest() org: Organization, @Body() body: EvergreenCategoryDto) {
    return this._evergreen.createCategory(org.id, body);
  }

  @Put('/categories/:id')
  update(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: EvergreenCategoryDto
  ) {
    return this._evergreen.updateCategory(org.id, id, body);
  }

  @Delete('/categories/:id')
  remove(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._evergreen.deleteCategory(org.id, id);
  }

  @Get('/categories/:id/items')
  items(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._evergreen.listItems(org.id, id);
  }

  @Post('/categories/:id/items')
  createItem(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: EvergreenItemDto
  ) {
    return this._evergreen.createItem(org.id, id, body);
  }

  @Put('/items/:id')
  updateItem(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: EvergreenItemDto
  ) {
    return this._evergreen.updateItem(org.id, id, body);
  }

  @Delete('/items/:id')
  deleteItem(@GetOrgFromRequest() org: Organization, @Param('id') id: string) {
    return this._evergreen.deleteItem(org.id, id);
  }

  @Get('/upcoming')
  upcoming(@GetOrgFromRequest() org: Organization) {
    return this._evergreen.upcoming(org.id);
  }

  @Post('/plan')
  plan(@GetOrgFromRequest() org: Organization) {
    return this._evergreen.plan(org.id);
  }
}
