import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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

export class PostResponseType {
  message: string;
  results: PostResponse[];
}

export class PostResponse {
  post_id: string;
  user_id: string;
  media_url: string;
  media_path: string;
  content: string;
}

export class UpdatePostRequest {
  content?: string;
}

export class DeletePostRequest {
  media_path: string;
}

export class likeResponse {
  post_id: string;
  user_id: string;
  media_url: string;
  content: string;
  likeCount: string;
}
