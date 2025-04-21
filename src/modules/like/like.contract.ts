import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class LikeCreateRequest {
  @ApiPropertyOptional()
  @IsOptional()
  user_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  post_id: string;
}

export class LikeCreateResponse {
  message: string;
  like_id: string;
}

export class LikeDeleteRequest {
  @ApiPropertyOptional()
  @IsOptional()
  user_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  post_id: string;
}

export class LikeDeleteResponse {
  message: string;
}
