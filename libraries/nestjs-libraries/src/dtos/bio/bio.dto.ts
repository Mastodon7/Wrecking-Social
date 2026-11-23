import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BioLinkDto {
  @IsString()
  @MaxLength(40)
  id: string;

  @IsString()
  @MaxLength(80)
  label: string;

  @IsString()
  @MaxLength(2000)
  @Matches(/^https?:\/\//i, { message: 'Links must start with http:// or https://' })
  url: string;
}

export class BioPageDto {
  @IsString()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/, {
    message: 'The address can use 3–40 lowercase letters, numbers and dashes',
  })
  slug: string;

  @IsString()
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  avatarUrl?: string;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  accent?: string;

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => BioLinkDto)
  links: BioLinkDto[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
