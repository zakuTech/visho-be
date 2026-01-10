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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import {
  LoginRequest,
  LoginResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ChangeEmailRequest,
  ChangeEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from './auth.contract';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req): Promise<{ message: string }> {
    return this.authService.logout(req.user.user_id);
  }

  @ApiOperation({
    summary: 'Send OTP for email or password change verification',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpRequest): Promise<SendOtpResponse> {
    return this.authService.sendOtp(body.email, body.verifyType);
  }

  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified',
    type: VerifyOtpResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user email (requires OTP verification)' })
  @ApiResponse({
    status: 200,
    description: 'Email changed',
    type: ChangeEmailResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already in use or invalid OTP',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('change-email')
  async changeEmail(
    @Request() req,
    @Body() body: ChangeEmailRequest,
  ): Promise<ChangeEmailResponse> {
    return this.authService.changeEmail(req.user.user_id, body.email, body.otp);
  }

  @ApiOperation({ summary: 'Change user password (requires OTP verification)' })
  @ApiResponse({
    status: 200,
    description: 'Password changed',
    type: ChangePasswordResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or password requirements not met',
  })
  @HttpCode(HttpStatus.OK)
  @Patch('change-password')
  async changePassword(
    @Body() body: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(body.email, body.password, body.otp);
  }
}
