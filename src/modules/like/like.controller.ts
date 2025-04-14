import {
  Controller,
  Post,
  Delete,
  Body,
  Get,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  LikeCreateRequest,
  LikeCreateResponse,
  LikeDeleteRequest,
  LikeDeleteResponse,
} from './like.contract';

@Controller('like')
@ApiTags('Like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Like' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        post_id: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: LikeCreateResponse })
  async createLike(
    @Request() req: any,
    @Body() body: LikeCreateRequest,
  ): Promise<LikeCreateResponse> {
    try {
      const response = await this.likeService.createLike({
        user_id: req?.user?.user_id,
        post_id: body.post_id,
      });
      const { like_id, message } = response;
      return {
        message,
        like_id,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Like' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        post_id: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async deleteLike(
    @Request() req: any,
    @Body() body: LikeDeleteRequest,
  ): Promise<LikeDeleteResponse> {
    try {
      const deleteLike = await this.likeService.deleteLike({
        user_id: req?.user?.user_id,
        post_id: body.post_id,
      });

      return {
        message: deleteLike.message,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
