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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  FollowCreateRequest,
  FollowCreateResponse,
  FollowDeleteRequest,
  FollowDeleteResponse,
} from './follow.contract';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Follow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        follower_user_id: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: FollowCreateResponse })
  async createLike(
    @Request() req: any,
    @Body() body: FollowCreateRequest,
  ): Promise<FollowCreateResponse> {
    try {
      const response = await this.followService.createFollow({
        follower_user_id: body.follower_user_id,
        user_id: body.user_id,
      });
      const { follower_id, message } = response;
      return {
        message,
        follower_id,
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
  @ApiOperation({ summary: 'Delete Follow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        follower_id: { type: 'string' },
        follower_user_id: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async deleteLike(
    @Request() req: any,
    @Body() body: FollowDeleteRequest,
  ): Promise<FollowDeleteResponse> {
    try {
      const deleteLike = await this.followService.deleteFollow({
        follower_id: req?.user?.user_id,
        follower_user_id: body.follower_user_id,
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
