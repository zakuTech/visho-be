import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  Request,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RegisterRequest,
  RegisterResponse,
  UserResponse,
  UploadPhotoAndBioRequest,
} from './user.contract';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

interface RequestWithUser {
  user: {
    user_id: string;
  };
}
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
  async getProfile(@Request() req: RequestWithUser): Promise<UserResponse> {
    return await this.userService.getUser(req?.user?.user_id);
  }

  @ApiBearerAuth()
  @Post('upload-bio-photo')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload bio, profile & cover photo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bio: { type: 'string' },
        profile: { type: 'string', format: 'binary' },
        cover: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ type: UserResponse })
  @UseGuards(JwtAuthGuard)
  async uploadPhotoAndBio(
    @UploadedFiles()
    files: { profile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: UploadPhotoAndBioRequest,
    @Request() req, // req.user.user_id dari JWT
  ): Promise<{ message: string; results: UserResponse }> {
    const response = await this.userService.uploadPhotoAndBio(
      {
        user_id: req.user.user_id,
        username: req.user.username,
        bio: body.bio,
      },
      files,
    );

    return {
      message: 'Success upload photo profile or bio or cover profile',
      results: response,
    };
  }
}
