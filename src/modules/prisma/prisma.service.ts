import {
  Injectable,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    this.$on('query', (e) => {
      this.logger.info(JSON.stringify(e));
    });

    this.$on('info', (e) => {
      this.logger.info(JSON.stringify(e));
    });

    this.$on('warn', (e) => {
      this.logger.warn(JSON.stringify(e));
    });

    this.$on('error', (e) => {
      this.logger.error(JSON.stringify(e));
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
