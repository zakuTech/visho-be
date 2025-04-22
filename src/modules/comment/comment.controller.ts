import { Controller, Post, Get, Patch, Delete, Body, Param, HttpException, HttpStatus, Inject} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CommentRequest, CommentResponse } from './comment.contract';
import { CommentService } from './comment.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
    private commentService: CommentService;
     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger;

    constructor(commentService: CommentService) {
        this.commentService = commentService;
    }

    @Post('post-comment')
    @ApiOperation({ summary: 'Post Comment' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                post_id: { type: 'string' },
                content: { type: 'string' },
            },
        },
    })
    @ApiResponse({ type: CommentResponse })
    async postComment(@Body() req: CommentRequest): Promise<{ message: string; results: CommentResponse }> {
        try {
            const response = await this.commentService.postComment(req);
            return {
                message: 'Success: Comment created',
                results: response,
            };
        } catch (error) {
            this.logger.error(`comment error: ${error.message}`);
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('get-all')
    @ApiOperation({ summary: 'Get Profile (Requires JWT)' })
    async getAllComment(): Promise<CommentResponse[]> {
        return await this.commentService.getAllComment();
    }

    @Get('get-by-id/:id')
    @ApiOperation({ summary: 'Get Post by ID (Requires JWT)' })
    @ApiResponse({ type: CommentResponse })
    async getCommentById(@Param('id') comment_id: string): Promise<CommentResponse> {
        return await this.commentService.getCommentById(comment_id);
    }

    @Patch('update/:id')
    @ApiOperation({ summary: 'Update Comment' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                content: { type: 'string' },
            },
        },
    })
    @ApiResponse({ type: CommentResponse })
    async update(@Param('id') comment_id:string ,@Body() req :CommentRequest): Promise<{ message:string; results:CommentResponse }> {
        try {
            const response = await this.commentService.updateComment(comment_id, req);
            return {
                message:'Success : Comment updated',
                results :response,
            };
        } catch (error) {
            this.logger.error(`update comment error: ${error.message}`);
            throw new HttpException(error.message,error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
   }

   @Delete('delete/:id')
   @ApiOperation({ summary:'Delete Post by ID (Requires JWT)'})
   @ApiResponse({type : CommentResponse})
   async deleteComment(@Param('id') comment_id:string ):Promise<{message:string}>{
       await this.commentService.deleteComment(comment_id);
       return{message:'Post berhasil dihapus'};
   }
}