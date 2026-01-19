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
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import {
  FollowCreateRequest,
  FollowCreateResponse,
  FollowDeleteRequest,
  FollowDeleteResponse,
} from './follow.contract';
import type { HttpResponse } from 'src/common/interfaces/api-response.interface';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create Follow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        following_user_id: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createLike(
    @Request() req: any,
    @Body() body: FollowCreateRequest,
  ): Promise<HttpResponse<FollowCreateResponse>> {
    try {
      const result = await this.followService.createFollow({
        follower_user_id: req.user.user_id,
        following_user_id: body.following_user_id,
      });
      return {
        success: true,
        message: 'Success create follow',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/')
  @ApiOperation({ summary: 'Delete Follow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        follower_user_id: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteLike(
    @Request() req: any,
    @Body() body: FollowDeleteRequest,
  ): Promise<FollowDeleteResponse> {
    try {
      const deleteLike = await this.followService.deleteFollow({
        following_user_id: body.follower_user_id,
        follower_user_id: req.user.user_id,
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
