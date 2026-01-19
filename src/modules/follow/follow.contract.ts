import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FollowCreateRequest {
  @ApiProperty()
  @IsNotEmpty()
  following_user_id?: string;
}

export class FollowCreateResponse {
  follower_id: string;
  following_id: string;
}

export class FollowDeleteRequest {
  @ApiProperty()
  @IsNotEmpty()
  follower_user_id?: string;
}

export class FollowDeleteResponse {
  message: string;
}
