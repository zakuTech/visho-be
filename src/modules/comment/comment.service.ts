import {
  Injectable,
  HttpException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { ValidationService } from '../prisma/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CommentValidation } from './comment.validation';
import { string } from 'joi';

interface PostCommentRequest {
  user_id: string;
  post_id: string;
  content: string;
}

interface Comment {
  comment_id: string;
  user_id: string;
  post_id: string;
  content: string;
}

@Injectable()
export class CommentService {
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

  async postComment(params: PostCommentRequest): Promise<Comment> {
    try {
      const { user_id, post_id, content } = params;
      const validate: PostCommentRequest = this.validationService.validate(
        CommentValidation.PostComment,
        params,
      ) as PostCommentRequest;

      const user = await this.prisma.users.findUnique({
        where: { user_id },
      });
      if (!user) {
        throw new HttpException('user not found', 404);
      }

      const post = await this.prisma.posts.findUnique({
        where: { post_id },
      });
      if (!post) {
        throw new HttpException('posts not found', 404);
      }

      const newComment = await this.prisma.comments.create({
        data: {
          comment_id: uuidv4(),
          user_id: validate.user_id,
          post_id: validate.post_id,
          content: validate.content,
        },
      });
      this.logger.info(`comment berhasil dipost ${newComment.comment_id}`);
      return newComment;
    } catch (error) {
      this.logger.error(
        `Failed to post comment: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to post comment', error.status || 500);
    }
  }

  async getAllComment(params: { user_id: string }): Promise<Comment[]> {
    const { user_id } = params;
    this.logger.info(`Get all comments by user id: ${user_id}`);
    const user = await this.prisma.users.findUnique({
      where: { user_id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const comments = await this.prisma.comments.findMany({
      select: {
        user_id: true,
        comment_id: true,
        post_id: true,
        content: true,
        post: {
          select: {
            post_id: true,
            user_id: true,
            media_url: true,
            content: true,
          },
        },
      },
      where: { user_id },
    });

    return comments;
  }

  async getCommentByPostId(params: { post_id: string }): Promise<Comment[]> {
    const { post_id } = params;
    const post = await this.prisma.posts.findUnique({
      where: { post_id },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const comment = await this.prisma.comments.findMany({
      select: {
        user_id: true,
        comment_id: true,
        post_id: true,
        content: true,
        user: {
          select: {
            user_id: true,
            username: true,
            photo_profile: true,
          },
        },
      },
      where: { post_id },
    });

    return comment;
  }

  async updateComment(params: {
    comment_id: string;
    content: string;
    post_id: string;
  }): Promise<Comment> {
    try {
      const { comment_id, content, post_id } = params;
      const comment = await this.prisma.comments.findFirst({
        where: { comment_id, post_id },
      });
      if (!comment) {
        throw new HttpException('comment not found', 404);
      }

      const updatedComment = await this.prisma.comments.update({
        where: { comment_id },
        data: {
          content: content,
        },
      });

      return updatedComment;
    } catch (error) {
      this.logger.error(
        `Failed to update comment: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to update comment', error.status || 500);
    }
  }

  async deleteComment(params: { comment_id: string }): Promise<null> {
    try {
      const { comment_id } = params;
      await this.prisma.comments.delete({
        where: { comment_id },
      });
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to delete Comment: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Failed to delete Comment', error.status || 500);
    }
  }
}
