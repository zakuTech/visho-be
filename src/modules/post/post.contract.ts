import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, isString } from 'class-validator';

export class PostRequest {
  @ApiProperty()
  @IsNotEmpty()
  content: string;
  media_url?: string;
  media_path?: string;
  media_file_buffer?: Buffer;
  media_file_mimetype?: string;
  media_file_originalname?: string;
}

export class PostResponse {
  post_id: string;
  user_id: string;
  media_url: string;
  media_path?: string;
  content: string;
}

export class UpdatePostRequest {
  @IsString()
  content?: string;
}

export class DeletePostRequest {
  @IsString()
  media_path: string;
}

export class likeResponse {
  post_id: string;
  user_id: string;
  media_url: string;
  content: string;
  likeCount: string;
}
