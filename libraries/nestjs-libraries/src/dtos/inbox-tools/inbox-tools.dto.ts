import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class InboxStateDto {
  @IsString()
  @IsDefined()
  integrationId: string;

  @IsString()
  @IsDefined()
  @MaxLength(300)
  commentId: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  // null clears the assignment
  @IsOptional()
  @IsString()
  assignedToId?: string | null;
}

export class SavedReplyDto {
  @IsString()
  @IsDefined()
  @MaxLength(80)
  title: string;

  @IsString()
  @IsDefined()
  @MaxLength(2000)
  content: string;
}

export class InboxKnowledgeDto {
  @IsString()
  @MaxLength(8000)
  knowledge: string;
}

export class InboxDraftDto {
  @IsString()
  @IsDefined()
  integrationId: string;

  @IsString()
  @IsDefined()
  @MaxLength(4000)
  commentText: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  postPreview?: string;
}
