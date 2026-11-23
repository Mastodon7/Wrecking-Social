import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DraftItemDto {
  // when the draft is planned for, ISO in UTC
  @IsDateString()
  date: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  integrationIds: string[];

  @IsString()
  @MaxLength(10000)
  text: string;
}

export class CreateDraftsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => DraftItemDto)
  items: DraftItemDto[];
}

export class RepurposeDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  text?: string;

  // the channels to write for
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  integrationIds: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  count?: number;

  // anything to steer the posts ("push the holiday sale")
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instructions?: string;
}
