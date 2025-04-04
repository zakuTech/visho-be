import { Module, forwardRef } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
// import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from 'src/common/logger.module'; // ✅ cukup ini

@Module({
  imports: [
    PrismaModule,
    // forwardRef(() => AuthModule),
    LoggerModule, // ✅ ini sudah ekspor logger
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
