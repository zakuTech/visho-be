import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class LikeCreateRequest {
  @ApiProperty()
  @IsNotEmpty()
  post_id: string;
}

export class LikeCreateResponse {
  like_id: string;
}

export class LikeDeleteRequest {
  @ApiProperty()
  @IsNotEmpty()
  post_id: string;
}

export class LikeDeleteResponse {
  message: string;
}
