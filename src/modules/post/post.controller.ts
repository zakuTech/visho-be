import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Request,
  UseGuards,
  BadRequestException,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiOperation,
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  DeletePostRequest,
  PostResponse,
  UpdatePostRequest,
} from './post.contract';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { HttpResponse } from 'src/common/interfaces/api-response.interface';

@ApiTags('Post')
@Controller('post')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create Post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        media_file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('media_file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        const allowedTypes = /(jpg|jpeg|png|mp4)$/;

        if (!file.mimetype.match(allowedTypes)) {
          return callback(
            new BadRequestException(
              'Only JPG, JPEG, PNG, or MP4 files are allowed!',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createPost(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10_000_000 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('content') content: string,
  ): Promise<HttpResponse<PostResponse>> {
    const response = await this.postService.createPost({
      user_id: req?.user?.user_id,
      content,
      media_file: file,
    });

    return {
      success: true,
      message: 'Success create post',
      data: response,
    };
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Get All Post' })
  async getAllPosts(): Promise<HttpResponse<PostResponse[]>> {
    const result = await await this.postService.getAllPosts();
    return {
      success: true,
      message: 'Success get all posts',
      data: result,
    };
  }

  @Get('get-by-user-id/:user_id')
  @ApiOperation({ summary: 'Get Post by User ID' })
  async getByUserId(
    @Param('user_id') user_id: string,
  ): Promise<HttpResponse<PostResponse[]>> {
    try {
      const results = await this.postService.getPostByUserId(user_id);
      return {
        success: true,
        message: 'Success get post by id',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get-by-post-id/:post_id')
  @ApiOperation({ summary: 'Get Post by Post ID' })
  async getByPostId(
    @Param('post_id') post_id: string,
  ): Promise<HttpResponse<PostResponse>> {
    try {
      const result = await this.postService.getPostByPostId(post_id);
      return {
        success: true,
        message: 'Success get post by id',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':post_id')
  @ApiOperation({ summary: 'Update Post by ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('post_id') post_id: string,
    @Body() body: UpdatePostRequest,
  ): Promise<HttpResponse<PostResponse>> {
    try {
      const response = await this.postService.update(post_id, body);
      return {
        success: true,
        message: 'Success update post',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth()
  @Delete(':post_id')
  @ApiOperation({ summary: 'Delete Post by ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        media_path: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Request() req,
    @Param('post_id') post_id: string,
    @Body() body: DeletePostRequest,
  ): Promise<HttpResponse<null>> {
    await this.postService.deletePost({
      ...body,
      post_id,
      user_id: req?.user?.user_id,
    });
    return {
      success: true,
      message: 'Success delete post',
      data: null,
    };
  }
}
