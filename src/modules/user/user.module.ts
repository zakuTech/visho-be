import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [forwardRef(() => AuthModule), SupabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
