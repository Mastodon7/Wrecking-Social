import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class EvergreenCategoryDto {
  @IsString()
  @MaxLength(80)
  name: string;

  // ISO weekdays, 1 = Monday ... 7 = Sunday
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  days: number[];

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  time: string;

  @IsString()
  @MaxLength(60)
  timezone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  integrationIds: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class EvergreenItemDto {
  @IsString()
  @MaxLength(10000)
  text: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
