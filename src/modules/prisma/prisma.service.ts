import {
  Injectable,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy
{
  private logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.logger = logger;
  }

  onModuleInit(): void {
    this.$on('info', (e) => {
      this.logger.info(JSON.stringify(e));
    });
    this.$on('error', (e) => {
      this.logger.error(JSON.stringify(e));
    });
    this.$on('query', (e) => {
      this.logger.info(JSON.stringify(e));
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
