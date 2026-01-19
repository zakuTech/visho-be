import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly baseStoragePath: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseStoragePath = process.env.STORAGE_PATH || './storage';

    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async uploadFile(
    bucket: string,
    filePath: string,
    file: Buffer,
    contentType: string,
  ): Promise<void> {
    try {
      const fullPath = path.join(this.baseStoragePath, bucket, filePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(fullPath, file);
    } catch (error) {
      console.error('Upload error:', error.message);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getPublicUrl(bucket: string, filePath: string): Promise<string> {
    return `${this.baseUrl}/media/${bucket}/${filePath}`;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseStoragePath, bucket, filePath);
      await fs.unlink(fullPath);

      const dir = path.dirname(fullPath);
      const files = await fs.readdir(dir);
      if (files.length === 0) {
        await fs.rmdir(dir);
      }
    } catch (error) {
      console.error('Delete error:', error.message);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
