import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
// import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PostController } from './post.controller';
import { LoggerModule } from 'src/common/logger.module';

@Module({
    imports: [
        PrismaModule,
        LoggerModule,
        // forwardRef(() => AuthModule),
    ],
    controllers: [PostController],
    providers: [PostService, PrismaService],
    exports: [PostService, PrismaService],
})
export class PostModule {}