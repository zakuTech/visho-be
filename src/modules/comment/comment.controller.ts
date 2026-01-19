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
  Inject,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CommentRequest, CommentResponse } from './comment.contract';
import { CommentService } from './comment.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { HttpResponse } from 'src/common/interfaces/api-response.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
  private commentService: CommentService;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  @Post('post-comment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Post Comment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        post_id: { type: 'string' },
        content: { type: 'string' },
      },
    },
  })
  async postComment(
    @Req() req: any,
    @Body() body: CommentRequest,
  ): Promise<HttpResponse<CommentResponse>> {
    try {
      const response = await this.commentService.postComment({
        ...body,
        user_id: req?.user?.user_id,
      });
      return {
        success: true,
        message: 'Success: Comment created',
        data: response,
      };
    } catch (error) {
      this.logger.error(`comment error: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get-by-user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Profile' })
  async getAllComment(
    @Request() req: any,
  ): Promise<HttpResponse<CommentResponse[]>> {
    const result = await this.commentService.getAllComment({
      user_id: req?.user?.user_id,
    });
    return {
      success: true,
      message: 'Success get all comment by user',
      data: result,
    };
  }

  @Get('get-by-post/:post_id')
  @ApiOperation({ summary: 'Get Post by ID' })
  async getCommentById(
    @Param('post_id') post_id: string,
  ): Promise<HttpResponse<CommentResponse[]>> {
    const result = await this.commentService.getCommentByPostId({
      post_id,
    });
    return {
      success: true,
      message: 'Success get all comment by post',
      data: result,
    };
  }

  @Patch('update/:comment_id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update Comment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        post_id: { type: 'string' },
      },
    },
  })
  async update(
    @Param('comment_id') comment_id: string,
    @Body() body: CommentRequest,
  ): Promise<HttpResponse<CommentResponse>> {
    const response = await this.commentService.updateComment({
      comment_id,
      content: body.content,
      post_id: body.post_id,
    });
    return {
      success: true,
      message: 'Success : Comment updated',
      data: response,
    };
  }

  @Delete('delete/:comment_id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete Comment by ID (Requires JWT)' })
  async deleteComment(
    @Param('comment_id') comment_id: string,
  ): Promise<HttpResponse<null>> {
    await this.commentService.deleteComment({ comment_id });
    return {
      success: true,
      message: 'Success delete comment',
      data: null,
    };
  }
}
