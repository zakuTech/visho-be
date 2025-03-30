import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly username?: string;
}

export class RegisterResponseType {
  readonly message?: string;
  readonly results: RegisterResponse;
}
export class RegisterResponse {
  readonly user_id: string;
  readonly username: string;
  readonly email: string;
}

export class UserResponse {
  readonly user_id: string;
  readonly username: string;
  readonly email: string;
  readonly profile_picture?: string;
  readonly bio?: string;
}
