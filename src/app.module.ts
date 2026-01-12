import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CommentModule } from './modules/comment/comment.module';
import { PostModule } from './modules/post/post.module';
import { LikeModule } from './modules/like/like.module';
import { CommonModule } from './common/common.module';
import { FollowModule } from './modules/follow/follow.module';
import * as Joi from 'joi';
import { StorageModule } from './modules/storage/storage.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRY: Joi.string().default('1d'),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CommentModule,
    PostModule,
    CommonModule,
    LikeModule,
    FollowModule,
    StorageModule,
    MediaModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
