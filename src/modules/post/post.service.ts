import {
  Injectable,
  HttpException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ValidationService } from '../prisma/validation.service';
import { PostValidation } from './post.validation';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma/prisma.service';
import {
  PostResponse,
  UpdatePostRequest,
  PostRequest,
  likeResponse,
} from './post.contract';
import { SupabaseService } from '../supabase/supabase.service';
import { sanitizeFileName } from 'src/media/media.controller';

@Injectable()
export class PostService {
  private prisma: PrismaService;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;
  private validationService: ValidationService;

  constructor(
    prisma: PrismaService,
    logger: Logger,
    validationService: ValidationService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.prisma = prisma;
    this.logger = logger;
    this.validationService = validationService;
  }

  async createPost(req: {
    user_id: string;
    content: string;
    media_file: Express.Multer.File;
  }): Promise<PostResponse> {
    this.logger.info(`Create post request: ${JSON.stringify(req)}`);

    let mediaUrl: string | undefined;
    let mediaPath: string | undefined;

    if (req.media_file) {
      const sanitizedFileName = sanitizeFileName(req.media_file.originalname);
      const filename = `${Date.now()}-${sanitizedFileName}`;
      mediaPath = `posts/${filename}`;

      await this.supabaseService.uploadFile(
        process.env.SUPABASE_BUCKET_NAME,
        mediaPath,
        req.media_file.buffer,
        req.media_file.mimetype,
      );

      mediaUrl = await this.supabaseService.getPublicUrl(
        process.env.SUPABASE_BUCKET_NAME,
        mediaPath,
      );
    }

    const existingUser = await this.prisma.users.findFirst({
      where: { user_id: req.user_id },
    });
    if (!existingUser) {
      throw new HttpException('Username already exists', 404);
    }
    const newUser = await this.prisma.posts.create({
      data: {
        post_id: uuidv4(),
        user_id: existingUser.user_id,
        media_path: mediaPath,
        media_url: mediaUrl,
        content: req.content,
      },
    });
    this.logger.info(`post berhasil membuat postingan ${newUser.post_id}`);
    return newUser;
  }

  async getAllPosts(): Promise<PostResponse[]> {
    const posts = await this.prisma.posts.findMany();
    if (!posts.length) {
      throw new BadRequestException('No posts found');
    }
    return posts;
  }

  async getPostByUserId(user_id: string): Promise<PostResponse[]> {
    const posts = await this.prisma.posts.findMany({
      where: { user_id: user_id },
    });
    if (!posts) {
      throw new BadRequestException('Post not found');
    }
    return posts;
  }

  async getPostByPostId(postId: string): Promise<PostResponse> {
    const post = await this.prisma.posts.findUnique({
      where: { post_id: postId },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return post;
  }

  async getLikeByPost(postId: string): Promise<likeResponse> {
    const post = await this.prisma.posts.findUnique({
      where: { post_id: postId },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const likeCount = await this.prisma.likes.count({
      where: {
        post_id: post.post_id,
      },
    });
    return {
      ...post,
      likeCount: likeCount.toString(),
    };
  }

  async update(
    post_id: string,
    req: UpdatePostRequest,
  ): Promise<{ message: string; results: PostResponse }> {
    const updateRequest = this.validationService.validate(
      PostValidation.Update,
      req,
    ) as PostRequest;

    const post = await this.prisma.posts.findUnique({
      where: { post_id: post_id },
    });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    const updatedPost = await this.prisma.posts.update({
      where: { post_id: post_id },
      data: {
        content: updateRequest.content,
      },
    });

    this.logger.info(`post berhasil update ${updatedPost.post_id}`);
    return {
      message: 'Post updated successfully',
      results: updatedPost,
    };
  }

  async deletePost(params: {
    post_id: string;
    media_path: string;
    user_id: string;
  }): Promise<{ message: string }> {
    await this.prisma.posts.delete({
      where: { post_id: params.post_id, user_id: params.user_id },
    });
    await this.supabaseService.deleteFile(
      process.env.SUPABASE_BUCKET_NAME,
      params.media_path,
    );
    this.logger.info(`post berhasil dihapus ${params.post_id}`);
    return { message: 'Post berhasil dihapus' };
  }
}
