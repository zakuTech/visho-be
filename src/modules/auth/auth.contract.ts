import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum EVerifyType {
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export class LoginRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}

export class LoginResponse {
  readonly message: string;
  readonly access_token?: string;
}

export class sendOtpRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ enum: EVerifyType, example: EVerifyType.CHANGE_PASSWORD })
  @IsEnum(EVerifyType)
  verifyType: EVerifyType;
}

export class sendOtpResponse {
  readonly message: string;
  readonly otp?: string;
}

export class getOtpResponse {
  readonly otp?: string;
}

export class verifyOtpRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}

export class changeEmailRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  email: string;
}

export class changePasswordRequest {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'user*123' })
  @IsString()
  password: string;
}
