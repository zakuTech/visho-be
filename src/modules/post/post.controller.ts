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
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  DeletePostRequest,
  likeResponse,
  PostRequest,
  PostResponse,
  PostResponseType,
  UpdatePostRequest,
} from './post.contract';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Post')
@Controller('post')
export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  @ApiBearerAuth()
  @Post()
  @UseInterceptors(
    FileInterceptor('media_file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
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
  @ApiResponse({ type: PostResponse })
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() body: PostRequest,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; results: PostResponse }> {
    const response = await this.postService.createPost({
      ...body,
      user_id: req?.user?.user_id,
      media_file: file,
    });
    return {
      message: 'Success create user',
      results: response,
    };
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Get All Post' })
  async getAllPosts(): Promise<PostResponse[]> {
    return await this.postService.getAllPosts();
  }

  @Get('get-by-user-id/:user_id')
  @ApiOperation({ summary: 'Get Post by User ID' })
  @ApiResponse({ type: PostResponseType })
  async getByUserId(
    @Param('user_id') user_id: string,
  ): Promise<PostResponseType> {
    try {
      const results = await this.postService.getPostByUserId(user_id);
      return {
        message: 'Success get post by id',
        results,
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
  @ApiResponse({ type: PostResponseType })
  async getByPostId(
    @Param('post_id') post_id: string,
  ): Promise<{ message: string; result: PostResponse }> {
    try {
      const result = await this.postService.getPostByPostId(post_id);
      return {
        message: 'Success get post by id',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('like-count/:post_id')
  @ApiOperation({ summary: 'Get like count by post ID (Requires JWT)' })
  @ApiResponse({ type: likeResponse })
  async getLikeCount(
    @Param('post_id') post_id: string,
  ): Promise<{ message: string; results: likeResponse }> {
    try {
      const result = await this.postService.getLikeByPost(post_id);
      return {
        message: 'Success',
        results: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth()
  @Patch(':post_id')
  @ApiOperation({ summary: 'Update Post by ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        media_url: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  @ApiResponse({ type: PostResponse })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('post_id') post_id: string,
    @Body() req: UpdatePostRequest,
  ): Promise<{ message: string; results: PostResponse }> {
    try {
      const response = await this.postService.update(post_id, req);
      return {
        message: response.message,
        results: response.results,
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
  @ApiResponse({ type: PostResponse })
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
  ): Promise<{ message: string }> {
    await this.postService.deletePost({
      ...body,
      post_id,
      user_id: req?.user?.user_id,
    });
    return { message: 'Post berhasil dihapus' };
  }
}
