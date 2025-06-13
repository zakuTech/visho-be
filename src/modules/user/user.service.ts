import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UploadPhotoAndBioRequest, UserResponse } from './user.contract';
import { SupabaseService } from '../supabase/supabase.service';
import { sanitizeFileName } from 'src/media/media.controller';
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

  constructor(
    prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.prisma = prisma;
  }

  async register(req: RegisterRequest): Promise<UserResponse> {
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
  }

  async getUser(userId: string): Promise<UserResponse | null> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async uploadPhotoAndBio(
    req: UploadPhotoAndBioRequest,
    files: { profile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<UserResponse> {
    this.logger.info(`Update photo or bio request: ${JSON.stringify(req)}`);

    const user = await this.prisma.users.findUnique({
      where: { user_id: req.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let photoProfileUrl = user.photo_profile;
    let coverProfileUrl = user.cover_profile;
    let photoProfilePath = user.photo_profile_path;
    let coverProfilePath = user.cover_profile_path;

    if (files?.profile?.[0]) {
      const file = files.profile[0];
      const sanitizedFileName = sanitizeFileName(file.originalname);
      const filename = `${Date.now()}-${sanitizedFileName}`;
      const profilePath = `test/profiles/${filename}`;

      // Hapus file lama jika ada
      if (user.photo_profile_path) {
        await this.supabaseService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          user.photo_profile_path,
        );
      }

      if (user.photo_profile) {
        await this.supabaseService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          user.photo_profile,
        );
      }

      await this.supabaseService.uploadFile(
        process.env.SUPABASE_BUCKET_NAME,
        profilePath,
        file.buffer,
        file.mimetype,
      );

      photoProfileUrl = await this.supabaseService.getPublicUrl(
        process.env.SUPABASE_BUCKET_NAME,
        profilePath,
      );

      photoProfilePath = profilePath;
    }

    if (files?.cover?.[0]) {
      const file = files.cover[0];
      const sanitizedFileName = sanitizeFileName(file.originalname);
      const filename = `${Date.now()}-${sanitizedFileName}`;
      const coverPath = `test/cover/${filename}`;

      // Hapus file lama jika ada
      if (user.cover_profile_path) {
        await this.supabaseService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          user.cover_profile_path,
        );
      }

      if (user.cover_profile) {
        await this.supabaseService.deleteFile(
          process.env.SUPABASE_BUCKET_NAME,
          user.cover_profile,
        );
      }

      await this.supabaseService.uploadFile(
        process.env.SUPABASE_BUCKET_NAME,
        coverPath,
        file.buffer,
        file.mimetype,
      );

      coverProfileUrl = await this.supabaseService.getPublicUrl(
        process.env.SUPABASE_BUCKET_NAME,
        coverPath,
      );

      coverProfilePath = coverPath;
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        bio: req.bio ?? user.bio,
        photo_profile: photoProfileUrl,
        photo_profile_path: photoProfilePath,
        cover_profile: coverProfileUrl,
        cover_profile_path: coverProfilePath,
      },
    });

    this.logger.info(
      `Profile atau bio berhasil diperbarui: ${updatedUser.user_id}`,
    );

    return updatedUser;
  }
}
