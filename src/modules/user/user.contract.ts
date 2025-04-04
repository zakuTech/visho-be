// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { IsNotEmpty, IsOptional } from 'class-validator';

// export class RegisterRequest {
//     @ApiProperty()
//     @IsNotEmpty()
//     email: string;

//     @ApiProperty()
//     @IsNotEmpty()
//     password: string;

//     @ApiPropertyOptional()
//     @IsOptional()
//     username?: string;
// }

// export class RegisterResponseType {
//     message: string;
//     results: any; // Replace 'any' with a more specific type if available
// }

// export class RegisterResponse {
//     user_id: string; // Adjust the type based on your requirements
//     username: string;
//     email: string;
// }

// export class UserResponse {
//     user_id: string; // Adjust the type based on your requirements
//     username: string;
//     email: string;
//     profile_picture?: string; // Optional field
//     bio?: string; // Optional field
// }