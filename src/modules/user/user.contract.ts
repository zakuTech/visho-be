import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiPropertyOptional()
  username: string;

  @ApiPropertyOptional()
  profile_picture?: string;
}

export class RegisterResponseType {
  message: string;
  results: RegisterResponse;
}

export class RegisterResponse {
  user_id: string;
  username: string;
  email: string;
}

export class UserResponse {
  user_id: string;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
}

export class editRequest {
  user_id: string;
  username: string;
  photo_profile?: string;
  photo_profile_path?: string;
  bio?: string;
  cover_profile?: string;
  cover_profile_path?: string;
}
