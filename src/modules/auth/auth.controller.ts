import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { JwtAuthGuard } from './jwt-auth.guard';
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiTags,
  } from '@nestjs/swagger';
  import { LoginRequest, LoginResponse, AuthUser } from './auth.contract';
  
  @ApiTags('Auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @ApiOperation({ summary: 'Login User' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    })
    @Post('login')
    async login(@Body() req: LoginRequest): Promise<LoginResponse> {
      return await this.authService.login(req);
    }
  
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Request() req) {
      return this.authService.logout(req?.user?.user_id);
    }
  }
  