import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from 'src/common/logger.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [forwardRef(() => AuthModule), LoggerModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
