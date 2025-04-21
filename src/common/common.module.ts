import { Global, Module } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../modules/prisma/prisma.service';
import { ValidationService } from '../modules/prisma/validation.service';

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            format: winston.format.json(),
            transports: [
                new winston.transports.Console()
            ]
        }),
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    providers: [PrismaService, ValidationService],
    exports: [PrismaService, ValidationService]
})
export class CommonModule {}