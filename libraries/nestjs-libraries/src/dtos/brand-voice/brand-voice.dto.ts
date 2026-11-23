import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class BrandVoiceProfileDto {
  @IsString()
  @MaxLength(6000)
  profile: string;
}

export class BrandVoiceLearnDto {
  // anything the owner wants the voice to know ("we're a family print shop")
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class BrandVoiceWriteDto {
  @IsIn(['rewrite', 'idea'])
  mode: 'rewrite' | 'idea';

  @IsString()
  @MaxLength(8000)
  text: string;

  // the channel the post is for; "" or missing uses the default voice
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  platform?: string;
}
