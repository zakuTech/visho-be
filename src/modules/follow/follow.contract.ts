import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FollowCreateRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  following_user_id: string;
}

export class FollowCreateResponse {
  follower_id: string;
  following_id: string;
  is_following: boolean;
}

export class FollowDeleteRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  following_user_id: string;
}

export class FollowDeleteResponse {
  message: string;
  is_following: boolean;
}

export class CheckFollowStatusRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  target_user_id: string;
}

export class CheckFollowStatusResponse {
  is_following: boolean;
  is_followed_by: boolean;
}

export class FollowerUser {
  user_id: string;
  username: string;
  photo_profile?: string;
  bio?: string;
  is_following: boolean;
}

export class GetFollowersResponse {
  followers: FollowerUser[];
  total: number;
}

export class FollowingUser {
  user_id: string;
  username: string;
  photo_profile?: string;
  bio?: string;
  is_following: boolean;
}

export class GetFollowingResponse {
  following: FollowingUser[];
  total: number;
}

export class FollowStatsResponse {
  followers_count: number;
  following_count: number;
}

export class GetMutualFollowersResponse {
  mutual_followers: FollowerUser[];
  total: number;
}

export class FollowSuggestion {
  user_id: string;
  username: string;
  photo_profile?: string;
  bio?: string;
  mutual_followers_count: number;
}

export class GetFollowSuggestionsResponse {
  suggestions: FollowSuggestion[];
  total: number;
}
