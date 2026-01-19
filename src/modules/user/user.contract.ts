import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'secret*123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'john' })
  @IsString()
  username: string;
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
  photo_profile?: string;
  cover_profile?: string;
  follower?: number;
  following?: number;
}

export class EditRequest {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profile?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  cover?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;
}
