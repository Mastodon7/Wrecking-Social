import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ReportSettingDto {
  @IsString()
  @MaxLength(80)
  brandName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  logoUrl?: string;

  @Matches(/^#[0-9a-fA-F]{6}$/)
  accent: string;

  @IsString()
  @MaxLength(60)
  timezone: string;

  @IsString()
  @MaxLength(1000)
  recipients: string;

  @IsBoolean()
  monthlyEmail: boolean;
}

export class GenerateReportDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  month: string;
}
