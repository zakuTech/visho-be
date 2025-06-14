import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RegisterRequest,
  RegisterResponse,
  UserResponse,
} from './user.contract';

@Controller('user')
@ApiTags('User')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        username: { type: 'string' },
      },
    },
  })
  @ApiResponse({ type: RegisterResponse })
  async register(@Body() req: RegisterRequest): Promise<{
    message: string;
    results: { user_id: string; username: string; email: string };
  }> {
    const response = await this.userService.register(req);
    const { user_id, username, email } = response;
    return {
      message: 'Success create user',
      results: { user_id, username, email },
    };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Profile (Requires JWT)' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<UserResponse> {
    return await this.userService.getUser(req?.user?.user_id);
  }
}
