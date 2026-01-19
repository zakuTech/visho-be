import { Injectable, HttpException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  LikeCreateRequest,
  LikeCreateResponse,
  LikeDeleteRequest,
  LikeDeleteResponse,
} from './like.contract';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LikeService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.prisma = prisma;
    this.logger = logger;
  }

  async createLike(params: {
    user_id: string;
    post_id: string;
  }): Promise<LikeCreateResponse> {
    try {
      const { user_id, post_id } = params;
      this.logger.info(`CREATE LIKE WITH USER ID ${user_id || '-'}`);

      const isAlreadyLike = await this.prisma.likes.findFirst({
        where: {
          user_id: user_id,
          post_id: post_id,
        },
      });

      if (isAlreadyLike) {
        throw new HttpException('You already like this post', 400);
      }
      const result = await this.prisma.likes.create({
        data: {
          like_id: uuidv4(),
          user_id: user_id,
          post_id: post_id,
        },
      });

      return { like_id: result.like_id };
    } catch (error) {
      this.logger.error(`Failed like post: ${error.message}`, error.stack);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async deleteLike(params: {
    user_id: string;
    post_id: string;
  }): Promise<null> {
    try {
      const { user_id, post_id } = params;
      this.logger.info(`DELETE LIKE WITH USER ID ${user_id || '-'}`);

      const data = await this.prisma.likes.findFirst({
        where: {
          user_id: user_id,
          post_id: post_id,
        },
      });

      if (!data) {
        throw new HttpException('Like not found', 404);
      }

      await this.prisma.likes.delete({
        where: {
          like_id: data.like_id,
        },
      });

      return null;
    } catch (error) {
      this.logger.error(`Failed to delete like: ${error.message}`, error.stack);
      throw new HttpException('Failed to delete like', error.status || 500);
    }
  }
}
