import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { CarouselService } from '@gitroom/nestjs-libraries/database/prisma/carousel/carousel.service';

class CarouselWriteDto {
  @IsString()
  @MaxLength(6000)
  topic: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  slides?: number;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  platform?: string;
}

@ApiTags('Carousel')
@Controller('/carousel')
export class CarouselController {
  constructor(private _carousel: CarouselService) {}

  @Get('/status')
  status() {
    return { aiConfigured: this._carousel.aiConfigured() };
  }

  @Post('/write')
  write(@GetOrgFromRequest() org: Organization, @Body() body: CarouselWriteDto) {
    return this._carousel.write(org.id, body);
  }
}
