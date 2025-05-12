import { Injectable, HttpException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  FollowCreateRequest,
  FollowCreateResponse,
  FollowDeleteRequest,
  FollowDeleteResponse,
} from './follow.contract';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createFollow(req: FollowCreateRequest): Promise<FollowCreateResponse> {
    this.logger.info(`CREATE FOLLOW WITH USER ID ${req.user_id || '-'}`);

    const result = await this.prisma.followers.create({
      data: {
        follower_id: uuidv4(),
        user_id: req.user_id,
        follower_user_id: req.follower_user_id,
      },
    });

    return {
      message: 'Success: Follow created',
      follower_id: result.follower_id,
    };
  }

  async deleteFollow(
    params: FollowDeleteRequest,
  ): Promise<FollowDeleteResponse> {
    this.logger.info(
      `DELETE FOLLOW WITH USER ID ${params.follower_user_id || '-'}`,
    );

    const data = await this.prisma.followers.findFirst({
      where: {
        follower_id: params.follower_id,
        follower_user_id: params.follower_user_id,
      },
    });

    if (!data) {
      throw new HttpException('Follow not found', 404);
    }

    await this.prisma.followers.delete({
      where: {
        follower_id: data.follower_id,
      },
    });

    return { message: 'Success: Follow deleted' };
  }
}
