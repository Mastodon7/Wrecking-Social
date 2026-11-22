import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyPlatformCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  commentId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;
}
