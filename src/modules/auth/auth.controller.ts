import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  LoginRequest,
  LoginResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
} from './auth.contract';
import type { HttpResponse } from 'src/common/interfaces/api-response.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginRequest,
  ): Promise<HttpResponse<LoginResponse>> {
    const result = await this.authService.login(body);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req): Promise<HttpResponse<{ message: string }>> {
    const result = await this.authService.logout(req.user.user_id);
    return {
      success: true,
      message: 'Logout successful',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Send OTP for email or password change verification',
  })
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  async sendOtp(
    @Body() body: SendOtpRequest,
  ): Promise<HttpResponse<{ message: string }>> {
    const result = await this.authService.sendOtp(body.email, body.verifyType);
    return {
      success: true,
      message: result.message,
    };
  }

  @ApiOperation({ summary: 'Verify OTP code' })
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(
    @Body() body: VerifyOtpRequest,
  ): Promise<HttpResponse<{ message: string }>> {
    const result = await this.authService.verifyOtp(body.email, body.otp);
    return {
      success: true,
      message: result.message,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user email (requires OTP verification)' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('change-email')
  async changeEmail(
    @Request() req,
    @Body() body: ChangeEmailRequest,
  ): Promise<HttpResponse<{ message: string }>> {
    const result = await this.authService.changeEmail(
      req.user.user_id,
      body.email,
      body.otp,
    );
    return {
      success: true,
      message: result.message,
    };
  }

  @ApiOperation({ summary: 'Change user password (requires OTP verification)' })
  @HttpCode(HttpStatus.OK)
  @Patch('change-password')
  async changePassword(
    @Body() body: ChangePasswordRequest,
  ): Promise<HttpResponse<{ message: string }>> {
    const result = await this.authService.changePassword(
      body.email,
      body.password,
      body.otp,
    );
    return {
      success: true,
      message: result.message,
    };
  }
}
