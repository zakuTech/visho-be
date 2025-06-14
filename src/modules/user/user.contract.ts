import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  username: string;

  @ApiPropertyOptional()
  @IsOptional()
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

export class UploadPhotoAndBioRequest {
  user_id: string;
  username: string;
  photo_profile?: string;
  photo_profile_path?: string;
  bio?: string;
  cover_profile?: string;
  cover_profile_path?: string;
}
