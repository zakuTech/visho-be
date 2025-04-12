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
}

export class RegisterResponseType {
  message: string;
  results: any;
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
