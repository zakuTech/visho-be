import {
  Injectable,
  BadRequestException,
  Inject,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './user.contract';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  private prisma: PrismaService;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;

  constructor(prisma: PrismaService, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
  }

  async register(req: RegisterRequest): Promise<UserResponse> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

      if (!req.username || !usernameRegex.test(req.username)) {
        throw new BadRequestException(
          'Username must be at least 3 characters and may only contain letters, numbers, or underscores.',
        );
      }

      if (!req.email || !emailRegex.test(req.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (!req.password || req.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters');
      }

      const existingUser = await this.prisma.users.findFirst({
        where: {
          OR: [{ username: req.username }, { email: req.email }],
        },
      });
      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }
      const hashedPassword = await bcrypt.hash(req.password, 10);
      const newUser = await this.prisma.users.create({
        data: {
          user_id: uuidv4(),
          username: req.username,
          email: req.email,
          password: hashedPassword,
        },
      });
      return newUser;
    } catch (error) {
      this.logger.error(
        `Failed to register user: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to register user', error.status || 500);
    }
  }

  async getUser(userId: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`, error.stack);
      throw new HttpException('Failed to get user', error.status || 500);
    }
  }
}
