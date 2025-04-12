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
import { PostResponse, PostResponseType, UpdatePostRequest, PostRequest } from './post.contract';

@Injectable()
export class PostService {
  private prisma: PrismaService;
  @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;
  private validationService: ValidationService;

  constructor(
    prisma: PrismaService,
    logger: Logger,
    validationService: ValidationService,
  ) {
    this.prisma = prisma;
    this.logger = logger;
    this.validationService = validationService;
  }

    async createPost(req: { user_id: string; media_url?: string; content?: string }): Promise<any> {
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
                media_url: req.media_url,
                content: req.content,
            }
        });
        return newUser;
    }

    async getAllPosts(): Promise<any[]> {
        const posts = await this.prisma.posts.findMany();
        if (!posts.length) {
            throw new BadRequestException('No posts found');
        }
        return posts;
    }

    async getPostById(postId: string): Promise<any> {
        const post = await this.prisma.posts.findUnique({
            where: { post_id: postId },
        });
        if (!post) {
            throw new BadRequestException('Post not found');
        }
        return post;
    }

    async update(postId: string, req: any): Promise<{ message: string; results: any }> {
      // ✅ Pastikan tipe updateRequest tidak unknown
      const updateRequest = this.validationService.validate(PostValidation.Update, req) as PostRequest;

    const post = await this.prisma.posts.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      throw new HttpException('Post not found', 404);
    }

    const updatedPost = await this.prisma.posts.update({
      where: { post_id: postId },
      data: {
        media_url: updateRequest.media_url,
        content: updateRequest.content,
      },
    });

    return {
      message: 'Post updated successfully',
      results: updatedPost,
    };
  }

  async deletePost(postId: string): Promise<{ message: string }> {
    await this.prisma.posts.delete({
      where: { post_id: postId },
    });
    return { message: 'Post berhasil dihapus' };
  }
}
