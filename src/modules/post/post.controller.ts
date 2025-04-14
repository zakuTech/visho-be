import { Controller, Post, Get, Patch, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostRequest, PostResponse, PostResponseType, UpdatePostRequest } from './post.contract';

@ApiTags('Post')
@Controller('post')
export class PostController {
    private postService: PostService;

    constructor(postService: PostService) {
        this.postService = postService;
    }

    @Post('create-post')
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
    async createPost(@Body() req: PostRequest): Promise<{ message: string; results: PostResponse }> {
        const response = await this.postService.createPost(req);
        return {
            message: 'Success create user',
            results: response,
        };
    }

    @Get('get-all')
    @ApiOperation({ summary: 'Get Profile (Requires JWT)' })
    async getAllPosts(): Promise<PostResponse[]> {
        return await this.postService.getAllPosts();
    }

    @Get('get-by-id/:id')
@ApiOperation({ summary: 'Get Post by ID (Requires JWT)' })
@ApiResponse({ type: PostResponseType })
async getById(@Param('id') post_id: string): Promise<PostResponseType> {
    try {
        const result = await this.postService.getPostById(post_id);
        return {
            message: 'Success',
            results: result,
        };
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    async update(@Param('id') post_id:string, @Body() req :UpdatePostRequest): Promise<{ message:string; results:PostResponse }> {
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
   async deletePost(@Param('id') post_id:string):Promise<{message:string}>{
       await this.postService.deletePost(post_id);
       return{message:'Post berhasil dihapus'};
   }
}