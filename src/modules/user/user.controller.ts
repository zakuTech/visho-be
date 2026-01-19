import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  UploadedFiles,
  Patch,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  EditRequest,
  RegisterRequest,
  RegisterResponse,
  UserResponse,
} from './user.contract';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { HttpResponse } from 'src/common/interfaces/api-response.interface';

@Controller('user')
@ApiTags('User')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  async register(
    @Body() body: RegisterRequest,
  ): Promise<
    HttpResponse<{ user_id: string; username: string; email: string }>
  > {
    const response = await this.userService.register(body);
    const { user_id, username, email } = response;
    return {
      success: true,
      message: 'Success create user',
      data: { user_id, username, email },
    };
  }

  @Get('profile/:user_id')
  @ApiOperation({ summary: 'Get Profile' })
  async getProfile(
    @Param('user_id') user_id: string,
  ): Promise<HttpResponse<UserResponse>> {
    const result = await this.userService.getUser(user_id);
    return {
      success: true,
      message: 'Success get profile',
      data: result,
    };
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return callback(
              new BadRequestException('Only JPG, JPEG, PNG files are allowed!'),
              false,
            );
          }
          callback(null, true);
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload bio, profile & cover photo' })
  @ApiBody({
    description: 'Upload profile & cover photo',
    type: EditRequest,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async uploadPhotoAndBio(
    @UploadedFiles()
    files: { profile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: EditRequest,
    @Request() req,
  ): Promise<HttpResponse<UserResponse>> {
    const response = await this.userService.edit(
      req.user.user_id,
      {
        username: body.username,
        bio: body.bio,
      },
      files,
    );

    return {
      success: true,
      message: 'Success edit profile',
      data: response,
    };
  }
}
