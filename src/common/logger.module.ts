import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { Logger } from 'winston';

@Module({
    imports: [
      WinstonModule.forRoot({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.simple(),
            ),
          }),
        ],
      }),
    ],
    providers: [Logger],
    exports: [Logger, WinstonModule], // tambahkan Logger ke dalam array exports
  })
  export class LoggerModule {}
