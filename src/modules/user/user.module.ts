import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerModule } from 'src/common/logger.module';
import { StorageModule } from '../storage/storage.module';
@Module({
  imports: [forwardRef(() => AuthModule), LoggerModule, StorageModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
