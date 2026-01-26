import {
  Injectable,
  BadRequestException,
  Inject,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EditRequest, UserResponse } from './user.contract';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IStorageService } from '../storage/storage.interface';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  private prisma: PrismaService;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;

  constructor(
    prisma: PrismaService,
    logger: Logger,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {
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
      throw new HttpException(
        `Failed to register user ${error.message}`,
        error.status || 500,
      );
    }
  }

  async getUser(username: string): Promise<UserResponse | null> {
    const user = await this.prisma.users.findUnique({
      where: { username },
      select: {
        user_id: true,
        username: true,
        email: true,
        photo_profile: true,
        bio: true,
        cover_profile: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const following = await this.prisma.followers.count({
      where: {
        follower_user_id: user.user_id,
      },
    });
    const follower = await this.prisma.followers.count({
      where: {
        user_id: user.user_id,
      },
    });
    const result = {
      ...user,
      follower,
      following,
    };
    return result;
  }

  async edit(
    user_id: string,
    req: EditRequest,
    files: { profile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<UserResponse> {
    this.logger.info(`Update photo or bio request: ${JSON.stringify(req)}`);

    const user = await this.prisma.users.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let photoProfileUrl = user.photo_profile;
    let photoProfilePath = user.photo_profile_path;
    let coverProfileUrl = user.cover_profile;
    let coverProfilePath = user.cover_profile_path;

    if (files?.profile?.[0]) {
      const file = files.profile[0];
      const sanitizedName = this.sanitizeFileName(file.originalname);
      const filename = `${Date.now()}-${sanitizedName}`;
      const storagePath = `test/profiles/${filename}`;

      if (photoProfilePath) {
        await this.storageService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          photoProfilePath,
        );
      }

      await this.storageService.uploadFile(
        process.env.SUPABASE_BUCKET_NAME,
        storagePath,
        file.buffer,
        file.mimetype,
      );

      photoProfileUrl = await this.storageService.getPublicUrl(
        process.env.SUPABASE_BUCKET_NAME,
        storagePath,
      );
      photoProfilePath = storagePath;
    }

    if (files?.cover?.[0]) {
      const file = files.cover[0];
      const sanitizedName = this.sanitizeFileName(file.originalname);
      const filename = `${Date.now()}-${sanitizedName}`;
      const storagePath = `test/cover/${filename}`;

      if (coverProfilePath) {
        await this.storageService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          coverProfilePath,
        );
      }

      await this.storageService.uploadFile(
        process.env.SUPABASE_BUCKET_NAME,
        storagePath,
        file.buffer,
        file.mimetype,
      );

      coverProfileUrl = await this.storageService.getPublicUrl(
        process.env.SUPABASE_BUCKET_NAME,
        storagePath,
      );
      coverProfilePath = storagePath;
    }

    const updatedUser = await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        username: req.username ?? user.username,
        bio: req.bio ?? user.bio,
        photo_profile: photoProfileUrl,
        photo_profile_path: photoProfilePath,
        cover_profile: coverProfileUrl,
        cover_profile_path: coverProfilePath,
      },
    });

    this.logger.info(`Berhasil memperbarui user: ${updatedUser.user_id}`);

    return updatedUser;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/\s+/g, '_');
  }
}
