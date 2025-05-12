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

    try {
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
        throw new HttpException('User not found', 404);
      }

      const newPost = await this.prisma.posts.create({
        data: {
          post_id: uuidv4(),
          user_id: existingUser.user_id,
          media_path: mediaPath,
          media_url: mediaUrl,
          content: req.content,
        },
      });

      this.logger.info(`Post created successfully: ${newPost.post_id}`);
      return newPost;
    } catch (error) {
      this.logger.error(`Failed to create post: ${error.message}`, error.stack);
      throw new HttpException('Failed to create post', error.status || 500);
    }
  }

  async getAllPosts(): Promise<PostResponse[]> {
    try {
      const posts = await this.prisma.posts.findMany();
      if (!posts.length) {
        throw new BadRequestException('No posts found');
      }
      return posts;
    } catch (error) {
      this.logger.error(
        `Failed to get all posts: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to get all posts', error.status || 500);
    }
  }

  async getPostByUserId(user_id: string): Promise<PostResponse[]> {
    try {
      const posts = await this.prisma.posts.findMany({
        where: { user_id: user_id },
      });
      if (!posts) {
        throw new BadRequestException('Post not found');
      }
      return posts;
    } catch (error) {
      this.logger.error(`Failed to get posts: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get posts by user id',
        error.status || 500,
      );
    }
  }

  async getPostByPostId(postId: string): Promise<PostResponse> {
    try {
      const post = await this.prisma.posts.findUnique({
        where: { post_id: postId },
      });
      if (!post) {
        throw new BadRequestException('Post not found');
      }
      return post;
    } catch (error) {
      this.logger.error(`Failed to get posts: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get post by post id',
        error.status || 500,
      );
    }
  }

  async getLikeByPost(postId: string): Promise<likeResponse> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to get like: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get like by post id',
        error.status || 500,
      );
    }
  }

  async update(
    post_id: string,
    req: UpdatePostRequest,
  ): Promise<{ message: string; results: PostResponse }> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to update post: ${error.message}`, error.stack);
      throw new HttpException('Failed to update post', error.status || 500);
    }
  }

  async deletePost(params: {
    post_id: string;
    media_path: string;
    user_id: string;
  }): Promise<{ message: string }> {
    try {
      await this.prisma.posts.delete({
        where: { post_id: params.post_id, user_id: params.user_id },
      });
      await this.supabaseService.deleteFile(
        process.env.SUPABASE_BUCKET_NAME,
        params.media_path,
      );
      this.logger.info(`post berhasil dihapus ${params.post_id}`);
      return { message: 'Post berhasil dihapus' };
    } catch (error) {
      this.logger.error(`Failed to delete post: ${error.message}`, error.stack);
      throw new HttpException('Failed to delete post', error.status || 500);
    }
  }
}
