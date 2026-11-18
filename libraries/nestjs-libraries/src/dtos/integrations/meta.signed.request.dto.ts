import { IsDefined, IsString } from 'class-validator';

// Body of Meta's data deletion and deauthorize callbacks
// (application/x-www-form-urlencoded)
export class MetaSignedRequestDto {
  @IsString()
  @IsDefined()
  signed_request: string;
}
