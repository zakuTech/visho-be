import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PostRequest {
    @ApiProperty()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty()
    @IsNotEmpty()
    media_url: string;

    @ApiPropertyOptional()
    @IsNotEmpty()
    content?: string;
}

export class PostResponseType {
    message: string;
    results: PostResponse; // Replace 'any' with the appropriate type if known
}

export class PostResponse {
    post_id: string;
    user_id: string;
    media_url: string;
    content: string;
}

export class UpdatePostRequest {
    post_id: string;
    media_url?: string; // Optional property
    content?: string; // Optional property
}