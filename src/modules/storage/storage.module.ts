import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';
import { LocalStorageService } from './local-storage.service';

@Module({
  providers: [
    {
      provide: 'IStorageService',
      useClass:
        process.env.STORAGE_PROVIDER === 'supabase'
          ? SupabaseStorageService
          : LocalStorageService,
    },
  ],
  exports: ['IStorageService'],
})
export class StorageModule {}
