import { Controller, Post, Get, Patch, Delete, Body, Param, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostRequest, PostResponse } from './post.contract';

@ApiTags('Post')
@Controller('post')
export class PostController {
    private postService: PostService;

    constructor(postService: PostService) {
        this.postService = postService;
    }

    @Post('createPost')
    @ApiOperation({ summary: 'Create Post' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                media_url: { type: 'string' },
                content: { type: 'string' },
            },
        },
    })
    @ApiResponse({ type: PostResponse })
    async createPost(@Body() req: PostRequest): Promise<{ message: string; results: any }> {
        const response = await this.postService.createPost(req);
        return {
            message: 'Success create user',
            results: response,
        };
    }

    @Get('getAll')
    @ApiOperation({ summary: 'Get Profile (Requires JWT)' })
    async getAllPosts(@Request() req: any): Promise<any> {
        return await this.postService.getAllPosts();
    }

    @Get('getById/:id')
    @ApiOperation({ summary: 'Get Post by ID (Requires JWT)' })
    @ApiResponse({ type: PostResponse })
    async getById(@Param('id') post_id: string, @Request() req: any): Promise<any> {
        return await this.postService.getPostById(post_id);
    }

    @Patch('update/:id')
    @ApiOperation({ summary: 'Update Post by ID (Requires JWT)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                media_url: { type: 'string' },
                content: { type: 'string' },
            },
        },
    })
    @ApiResponse({ type: PostResponse })
    async update(@Param('id') post_id:string, @Body() req :PostRequest): Promise<{ message:string; results:any }> {
        try {
            const response = await this.postService.update(post_id, req);
            return {
                message : response.message,
                results : response.results,
            };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
   }

   @Delete('delete/:id')
   @ApiOperation({ summary:'Delete Post by ID (Requires JWT)'})
   @ApiResponse({type :PostResponse})
   async deletePost(@Param('id') post_id:string ,@Request() req:any):Promise<{message:string}>{
       await this.postService.deletePost(post_id);
       return{message:'Post berhasil dihapus'};
   }
}