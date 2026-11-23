import { IsBoolean, IsDefined, IsString, MaxLength } from 'class-validator';

export class LinkTrackingDto {
  @IsBoolean()
  @IsDefined()
  enabled: boolean;

  // comma or space separated, e.g. "25mprinting.com, wreckingsocial.com"
  @IsString()
  @MaxLength(1000)
  domains: string;

  @IsString()
  @MaxLength(100)
  medium: string;

  @IsString()
  @MaxLength(100)
  campaign: string;
}

export class HashtagGroupDto {
  @IsString()
  @IsDefined()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsDefined()
  @MaxLength(2000)
  tags: string;
}
