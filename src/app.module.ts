import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
// import { AuthModule } from './modules/auth/auth.module';
// import { UserModule } from './modules/user/user.module';
import { CommentModule } from './modules/comment/comment.module';
import { PostModule } from './modules/post/post.module';
import { CommonModule } from './common/common.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        // AuthModule,
        // UserModule,
        CommentModule,
        PostModule,
        CommonModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}