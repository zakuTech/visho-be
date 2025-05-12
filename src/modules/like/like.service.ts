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

  async createLike(req: LikeCreateRequest): Promise<LikeCreateResponse> {
    try {
      this.logger.info(`CREATE LIKE WITH USER ID ${req.user_id || '-'}`);

      const result = await this.prisma.likes.create({
        data: {
          like_id: uuidv4(),
          user_id: req.user_id,
          post_id: req.post_id,
        },
      });

      return { message: 'Success: Like created', like_id: result.like_id };
    } catch (error) {
      this.logger.error(`Failed like post: ${error.message}`, error.stack);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async deleteLike(params: LikeDeleteRequest): Promise<LikeDeleteResponse> {
    try {
      this.logger.info(`DELETE LIKE WITH USER ID ${params.user_id || '-'}`);

      const data = await this.prisma.likes.findFirst({
        where: {
          user_id: params.user_id,
          post_id: params.post_id,
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

      return { message: 'Success: Like deleted' };
    } catch (error) {
      this.logger.error(`Failed to delete like: ${error.message}`, error.stack);
      throw new HttpException('Failed to delete like', error.status || 500);
    }
  }
}
