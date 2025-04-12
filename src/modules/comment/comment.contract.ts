import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentRequest {
    @ApiProperty()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty()
    @IsNotEmpty()
    post_id: string;

    @ApiProperty()
    @IsNotEmpty()
    content: string;
}

export class CommentResponseType {
    errors?: string[];
    message: string;
    results?: CommentResponse; // Replace 'any' with a more specific type if known
}

export class CommentResponse {
    comment_id: string;
    user_id: string;
    post_id: string;
    content: string;
}