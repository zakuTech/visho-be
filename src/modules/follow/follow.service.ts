import { Injectable, HttpException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  FollowCreateResponse,
  FollowDeleteResponse,
  CheckFollowStatusResponse,
  GetFollowersResponse,
  GetFollowingResponse,
  FollowStatsResponse,
  GetMutualFollowersResponse,
  GetFollowSuggestionsResponse,
  FollowerUser,
  FollowingUser,
  FollowSuggestion,
} from './follow.contract';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createFollow(params: {
    following_user_id: string;
    follower_user_id: string;
  }): Promise<FollowCreateResponse> {
    const { following_user_id, follower_user_id } = params;
    this.logger.info(
      `CREATE FOLLOW: ${follower_user_id} -> ${following_user_id}`,
    );

    try {
      if (following_user_id === follower_user_id) {
        throw new HttpException('You cannot follow yourself', 400);
      }

      const targetUser = await this.prisma.users.findUnique({
        where: { user_id: following_user_id },
      });

      if (!targetUser) {
        throw new HttpException('User not found', 404);
      }

      const isAlreadyFollowing = await this.prisma.followers.findFirst({
        where: {
          user_id: following_user_id,
          follower_user_id,
        },
      });

      if (isAlreadyFollowing) {
        throw new HttpException('You are already following this user', 400);
      }

      const result = await this.prisma.followers.create({
        data: {
          follower_id: uuidv4(),
          user_id: following_user_id,
          follower_user_id: follower_user_id,
        },
      });

      return {
        following_id: result.user_id,
        follower_id: result.follower_user_id,
        is_following: true,
      };
    } catch (error) {
      this.logger.error(`Failed to follow: ${error.message}`, error.stack);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async deleteFollow(params: {
    following_user_id: string;
    follower_user_id: string;
  }): Promise<FollowDeleteResponse> {
    const { following_user_id, follower_user_id } = params;
    this.logger.info(
      `DELETE FOLLOW: ${follower_user_id} -> ${following_user_id}`,
    );

    try {
      const data = await this.prisma.followers.findFirst({
        where: { user_id: following_user_id, follower_user_id },
      });

      if (!data) {
        throw new HttpException('You are not following this user', 404);
      }

      await this.prisma.followers.delete({
        where: {
          follower_id: data.follower_id,
        },
      });

      return {
        message: 'Successfully unfollowed user',
        is_following: false,
      };
    } catch (error) {
      this.logger.error(`Failed to unfollow: ${error.message}`, error.stack);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async checkFollowStatus(params: {
    current_user_id: string;
    target_user_id: string;
  }): Promise<CheckFollowStatusResponse> {
    const { current_user_id, target_user_id } = params;

    try {
      const isFollowing = await this.prisma.followers.findFirst({
        where: {
          user_id: target_user_id,
          follower_user_id: current_user_id,
        },
      });

      const isFollowedBy = await this.prisma.followers.findFirst({
        where: {
          user_id: current_user_id,
          follower_user_id: target_user_id,
        },
      });

      return {
        is_following: !!isFollowing,
        is_followed_by: !!isFollowedBy,
      };
    } catch (error) {
      this.logger.error(
        `Failed to check follow status: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to check follow status',
        error.status || 500,
      );
    }
  }

  async getFollowers(params: {
    user_id: string;
    current_user_id: string;
    limit: number;
    offset: number;
  }): Promise<GetFollowersResponse> {
    const { user_id, current_user_id, limit, offset } = params;

    try {
      const followers = await this.prisma.followers.findMany({
        where: { user_id },
        include: {
          follower: {
            select: {
              user_id: true,
              username: true,
              photo_profile: true,
              bio: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
      });

      const total = await this.prisma.followers.count({
        where: { user_id },
      });

      const followerUsers: FollowerUser[] = await Promise.all(
        followers.map(async (f) => {
          const isFollowing = await this.prisma.followers.findFirst({
            where: {
              user_id: f.follower.user_id,
              follower_user_id: current_user_id,
            },
          });

          return {
            user_id: f.follower.user_id,
            username: f.follower.username,
            photo_profile: f.follower.photo_profile,
            bio: f.follower.bio,
            is_following: !!isFollowing,
          };
        }),
      );

      return {
        followers: followerUsers,
        total,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get followers: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to get followers', error.status || 500);
    }
  }

  async getFollowing(params: {
    user_id: string;
    current_user_id: string;
    limit: number;
    offset: number;
  }): Promise<GetFollowingResponse> {
    const { user_id, current_user_id, limit, offset } = params;

    try {
      const following = await this.prisma.followers.findMany({
        where: { follower_user_id: user_id },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              photo_profile: true,
              bio: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
      });

      const total = await this.prisma.followers.count({
        where: { follower_user_id: user_id },
      });

      const followingUsers: FollowingUser[] = await Promise.all(
        following.map(async (f) => {
          const isFollowing = await this.prisma.followers.findFirst({
            where: {
              user_id: f.user.user_id,
              follower_user_id: current_user_id,
            },
          });

          return {
            user_id: f.user.user_id,
            username: f.user.username,
            photo_profile: f.user.photo_profile,
            bio: f.user.bio,
            is_following: !!isFollowing,
          };
        }),
      );

      return {
        following: followingUsers,
        total,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get following: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to get following', error.status || 500);
    }
  }

  async getFollowStats(user_id: string): Promise<FollowStatsResponse> {
    try {
      const [followers_count, following_count] = await Promise.all([
        this.prisma.followers.count({ where: { user_id } }),
        this.prisma.followers.count({ where: { follower_user_id: user_id } }),
      ]);

      return {
        followers_count,
        following_count,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get follow stats: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to get follow stats',
        error.status || 500,
      );
    }
  }

  async getMutualFollowers(params: {
    current_user_id: string;
    target_user_id: string;
  }): Promise<GetMutualFollowersResponse> {
    const { current_user_id, target_user_id } = params;

    try {
      const currentUserFollowers = await this.prisma.followers.findMany({
        where: { user_id: current_user_id },
        select: { follower_user_id: true },
      });

      const targetUserFollowers = await this.prisma.followers.findMany({
        where: { user_id: target_user_id },
        select: { follower_user_id: true },
      });

      const currentFollowerIds = currentUserFollowers.map(
        (f) => f.follower_user_id,
      );
      const targetFollowerIds = targetUserFollowers.map(
        (f) => f.follower_user_id,
      );
      const mutualIds = currentFollowerIds.filter((id) =>
        targetFollowerIds.includes(id),
      );

      const mutualUsers = await this.prisma.users.findMany({
        where: { user_id: { in: mutualIds } },
        select: {
          user_id: true,
          username: true,
          photo_profile: true,
          bio: true,
        },
      });

      const mutual_followers: FollowerUser[] = await Promise.all(
        mutualUsers.map(async (user) => {
          const isFollowing = await this.prisma.followers.findFirst({
            where: {
              user_id: user.user_id,
              follower_user_id: current_user_id,
            },
          });

          return {
            ...user,
            is_following: !!isFollowing,
          };
        }),
      );

      return {
        mutual_followers,
        total: mutual_followers.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get mutual followers: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to get mutual followers',
        error.status || 500,
      );
    }
  }

  async getFollowSuggestions(params: {
    current_user_id: string;
    limit: number;
  }): Promise<GetFollowSuggestionsResponse> {
    const { current_user_id, limit } = params;

    try {
      const alreadyFollowing = await this.prisma.followers.findMany({
        where: { follower_user_id: current_user_id },
        select: { user_id: true },
      });

      const followingIds = alreadyFollowing.map((f) => f.user_id);

      const suggestions = await this.prisma.users.findMany({
        where: {
          user_id: {
            notIn: [...followingIds, current_user_id],
          },
        },
        select: {
          user_id: true,
          username: true,
          photo_profile: true,
          bio: true,
        },
        take: limit,
      });

      const suggestionsWithMutual: FollowSuggestion[] = await Promise.all(
        suggestions.map(async (user) => {
          const mutualResult = await this.getMutualFollowers({
            current_user_id,
            target_user_id: user.user_id,
          });

          return {
            ...user,
            mutual_followers_count: mutualResult.total,
          };
        }),
      );

      suggestionsWithMutual.sort(
        (a, b) => b.mutual_followers_count - a.mutual_followers_count,
      );

      return {
        suggestions: suggestionsWithMutual,
        total: suggestionsWithMutual.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get follow suggestions: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to get follow suggestions',
        error.status || 500,
      );
    }
  }

  async removeFollower(params: {
    user_id: string;
    follower_user_id: string;
  }): Promise<void> {
    const { user_id, follower_user_id } = params;

    try {
      const follower = await this.prisma.followers.findFirst({
        where: {
          user_id,
          follower_user_id,
        },
      });

      if (!follower) {
        throw new HttpException('Follower not found', 404);
      }

      await this.prisma.followers.delete({
        where: { follower_id: follower.follower_id },
      });
    } catch (error) {
      this.logger.error(
        `Failed to remove follower: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
