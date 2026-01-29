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
  Param,
  Query,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  FollowCreateRequest,
  FollowCreateResponse,
  FollowDeleteRequest,
  FollowDeleteResponse,
  CheckFollowStatusRequest,
  CheckFollowStatusResponse,
  GetFollowersResponse,
  GetFollowingResponse,
  FollowStatsResponse,
  GetMutualFollowersResponse,
  GetFollowSuggestionsResponse,
} from './follow.contract';
import type { HttpResponse } from 'src/common/interfaces/api-response.interface';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiBody({ type: FollowCreateRequest })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createFollow(
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
        message: 'Successfully followed user',
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
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiBody({ type: FollowDeleteRequest })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteFollow(
    @Request() req: any,
    @Body() body: FollowDeleteRequest,
  ): Promise<HttpResponse<FollowDeleteResponse>> {
    try {
      const result = await this.followService.deleteFollow({
        following_user_id: body.following_user_id,
        follower_user_id: req.user.user_id,
      });

      return {
        success: true,
        message: 'Successfully unfollowed user',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/status')
  @ApiOperation({
    summary: 'Check if current user follows target user and vice versa',
  })
  @ApiBody({ type: CheckFollowStatusRequest })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async checkFollowStatus(
    @Request() req: any,
    @Body() body: CheckFollowStatusRequest,
  ): Promise<HttpResponse<CheckFollowStatusResponse>> {
    try {
      const result = await this.followService.checkFollowStatus({
        current_user_id: req.user.user_id,
        target_user_id: body.target_user_id,
      });

      return {
        success: true,
        message: 'Follow status retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/followers/:user_id')
  @ApiOperation({ summary: 'Get list of followers for a user' })
  @ApiParam({ name: 'user_id', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFollowers(
    @Request() req: any,
    @Param('user_id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<HttpResponse<GetFollowersResponse>> {
    try {
      const result = await this.followService.getFollowers({
        user_id: userId,
        current_user_id: req.user.user_id,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      });

      return {
        success: true,
        message: 'Followers retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/following/:user_id')
  @ApiOperation({ summary: 'Get list of users that a user is following' })
  @ApiParam({ name: 'user_id', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFollowing(
    @Request() req: any,
    @Param('user_id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<HttpResponse<GetFollowingResponse>> {
    try {
      const result = await this.followService.getFollowing({
        user_id: userId,
        current_user_id: req.user.user_id,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      });

      return {
        success: true,
        message: 'Following retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/stats/:user_id')
  @ApiOperation({
    summary: 'Get followers and following count for a user',
  })
  @ApiParam({ name: 'user_id', type: 'string' })
  async getFollowStats(
    @Param('user_id') userId: string,
  ): Promise<HttpResponse<FollowStatsResponse>> {
    try {
      const result = await this.followService.getFollowStats(userId);

      return {
        success: true,
        message: 'Follow stats retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/mutual/:user_id')
  @ApiOperation({
    summary: 'Get mutual followers between current user and target user',
  })
  @ApiParam({ name: 'user_id', type: 'string' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMutualFollowers(
    @Request() req: any,
    @Param('user_id') userId: string,
  ): Promise<HttpResponse<GetMutualFollowersResponse>> {
    try {
      const result = await this.followService.getMutualFollowers({
        current_user_id: req.user.user_id,
        target_user_id: userId,
      });

      return {
        success: true,
        message: 'Mutual followers retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/suggestions')
  @ApiOperation({ summary: 'Get user suggestions to follow' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFollowSuggestions(
    @Request() req: any,
    @Query('limit') limit?: number,
  ): Promise<HttpResponse<GetFollowSuggestionsResponse>> {
    try {
      const result = await this.followService.getFollowSuggestions({
        current_user_id: req.user.user_id,
        limit: limit ? Number(limit) : 10,
      });

      return {
        success: true,
        message: 'Follow suggestions retrieved',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/remove-follower')
  @ApiOperation({ summary: 'Remove a follower from your followers list' })
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
  async removeFollower(
    @Request() req: any,
    @Body() body: { follower_user_id: string },
  ): Promise<HttpResponse<{ message: string }>> {
    try {
      await this.followService.removeFollower({
        user_id: req.user.user_id,
        follower_user_id: body.follower_user_id,
      });

      return {
        success: true,
        message: 'Follower removed successfully',
        data: { message: 'Follower removed' },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
