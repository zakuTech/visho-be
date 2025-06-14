import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  LoginRequest,
  LoginResponse,
  EVerifyType,
  sendOtpRequest,
  sendOtpResponse,
  getOtpResponse,
  verifyOtpRequest,
  changeEmailRequest,
  changePasswordRequest,
} from './auth.contract';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login User' })
  @Post('login')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return await this.authService.login(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout User' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req?.user?.user_id);
  }

  @ApiOperation({ summary: 'Send OTP' })
  @Post('send-otp')
  async sendOtp(@Body() body: sendOtpRequest): Promise<sendOtpResponse> {
    return await this.authService.sendOtp(body.email, body.verifyType);
  }

  @ApiOperation({ summary: 'GET OTP' })
  @Get('otp/:email')
  async getOtp(@Param('email') email: string): Promise<getOtpResponse> {
    return await this.authService.getOtp(email);
  }

  @ApiOperation({ summary: 'Verify OTP' })
  @Post('verify-otp')
  async verifyOtp(@Body() body: verifyOtpRequest): Promise<any> {
    return await this.authService.verifyOtp(body.email, body.otp);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change Email' })
  @Patch('change-email')
  @UseGuards(JwtAuthGuard)
  async changeEmail(@Request() req, @Body() body: changeEmailRequest) {
    return this.authService.changeEmail(req?.user?.user_id, body.email);
  }

  @ApiOperation({ summary: 'Change Password' })
  @Patch('change-password')
  async changePassword(@Body() body: changePasswordRequest) {
    return this.authService.changePassword(body.email, body.password);
  }
}
