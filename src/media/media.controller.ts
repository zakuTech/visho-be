import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../modules/supabase/supabase.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Express } from 'express';

export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/\s+/g, '_');
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload file to Supabase Storage' })
  async upload(@UploadedFile() file: Express.Multer.File) {
    const sanitizedFileName = sanitizeFileName(file.originalname);
    const filename = `${Date.now()}-${sanitizedFileName}`;
    const path = `uploads/${filename}`;

    await this.supabaseService.uploadFile(
      process.env.SUPABASE_BUCKET_NAME,
      path,
      file.buffer,
      file.mimetype,
    );
    const publicUrl = await this.supabaseService.getPublicUrl(
      process.env.SUPABASE_BUCKET_NAME,
      path,
    );

    return {
      url: publicUrl,
      path,
    };
  }

  @Delete('delete')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: 'uploads/yourfile.jpg' },
      },
    },
  })
  @ApiOperation({ summary: 'Delete file from Supabase Storage' })
  async delete(@Body('path') path: string) {
    await this.supabaseService.deleteFile(
      process.env.SUPABASE_BUCKET_NAME,
      path,
    );
    return { message: 'Deleted successfully', path };
  }

  @Get('url')
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Path of file in storage, e.g. uploads/image.jpg',
  })
  @ApiOperation({ summary: 'Get public URL of file in Supabase Storage' })
  async getUrl(@Query('path') path: string) {
    const publicUrl = await this.supabaseService.getPublicUrl(
      process.env.SUPABASE_BUCKET_NAME,
      path,
    );
    return { url: publicUrl, path };
  }
}
