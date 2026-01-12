import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';

@Controller('media')
export class MediaController {
  private readonly baseStoragePath: string;

  constructor() {
    this.baseStoragePath = process.env.STORAGE_PATH || './storage';
  }

  @Get('*path')
  async serveFile(
    @Param('path') pathSegments: string | string[],
    @Res() res: Response,
  ) {
    try {
      const fullPath = Array.isArray(pathSegments)
        ? pathSegments.join('/')
        : pathSegments;

      console.log('Requested path:', fullPath);

      const filePath = path.join(this.baseStoragePath, fullPath);

      console.log('Full file path:', filePath);

      await fs.access(filePath);

      const contentType = mime.lookup(filePath) || 'application/octet-stream';

      const file = await fs.readFile(filePath);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(file);
    } catch (error) {
      console.error('File serve error:', error);
      throw new NotFoundException(`File not found`);
    }
  }
}
