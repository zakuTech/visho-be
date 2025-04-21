import { Module, forwardRef } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
