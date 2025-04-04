import { Injectable, HttpException, BadRequestException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { ValidationService } from '../prisma/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

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
  @Inject('winston') private readonly logger: WinstonLogger;
  private validationService: ValidationService;

  constructor(prisma: PrismaService, logger: Logger, validationService: ValidationService) {
    this.prisma = prisma;
    this.logger = logger;
    this.validationService = validationService;
  }

  async postComment(req: PostCommentRequest): Promise<Comment> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: req.user_id },
    });
    if (!user) {
      throw new HttpException("user not found", 404);
    }
    
    const post = await this.prisma.posts.findUnique({
      where: { post_id: req.post_id },
    });
    if (!post) {
      throw new HttpException("posts not found", 404);
    }
    
    const newComment = await this.prisma.comments.create({
      data: {
        comment_id: uuidv4(),
        user_id: req.user_id,
        post_id: req.post_id,
        content: req.content,
      }
    });
    
    return newComment;
  }

  async getAllComment(): Promise<Comment[]> {
    const comments = await this.prisma.comments.findMany();
    if (!comments.length) {
      throw new BadRequestException('No posts found');
    }
    
    return comments;
  }

  async getCommentById(comment_id: string): Promise<Comment> {
    const comment = await this.prisma.comments.findFirst({ where: { comment_id } });
    if (!comment) {
      throw new BadRequestException('comment not found');
    }
    
    return comment;
  }

  async updateComment(comment_id: string, req: Partial<PostCommentRequest>): Promise<Comment> {
    const comment = await this.prisma.comments.findFirst({ where: { comment_id } });
    if (!comment) {
      throw new HttpException('comment not found', 404);
    }
    
    const updatedComment = await this.prisma.comments.update({
      where: { comment_id },
      data: {
        content: req.content,
      },
   });

   return updatedComment;
 }

 async deleteComment(comment_id:string): Promise<{ message:string }> {
   await this.prisma.comments.delete({
     where:{ comment_id },
   });
   return { message:'Post berhasil dihapus' };
 }
}