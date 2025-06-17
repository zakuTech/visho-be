import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LoggerModule } from 'src/common/logger.module';
@Module({
  imports: [forwardRef(() => AuthModule), SupabaseModule, LoggerModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, SupabaseService],
})
export class UserModule {}
