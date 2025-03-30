import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import {
  RegisterResponse,
  RegisterRequest,
  RegisterResponseType,
  UserResponse,
} from './user.contract';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async register(@Body() req: RegisterRequest): Promise<RegisterResponseType> {
    const response = await this.userService.register(req);
    const { user_id, username, email } = response;
    return {
      message: 'Success create user',
      results: { user_id, username, email },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Profile (Requires JWT)' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<UserResponse> {
    return await this.userService.getUser(req?.user?.user_id);
  }
}
