import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PostController } from './post.controller';
import { LoggerModule } from 'src/common/logger.module';
import { StorageModule } from '../storage/storage.module';
@Module({
  imports: [PrismaModule, LoggerModule, StorageModule],
  controllers: [PostController],
  providers: [PostService, PrismaService],
  exports: [PostService, PrismaService],
})
export class PostModule {}
