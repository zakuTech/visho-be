import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FollowCreateRequest {
  @ApiProperty()
  @IsNotEmpty()
  user_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  follower_user_id: string;
}

export class FollowCreateResponse {
  follower_id: string;
  message: string;
}

export class FollowDeleteRequest {
  @ApiPropertyOptional()
  @IsOptional()
  follower_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  follower_user_id: string;
}

export class FollowDeleteResponse {
  message: string;
}
