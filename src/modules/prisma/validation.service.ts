import { Injectable } from '@nestjs/common';
import { ZodTypeAny } from 'zod';

@Injectable()
export class ValidationService {
    validate(zodtype: ZodTypeAny, data: unknown): unknown {
        return zodtype.parse(data);
    }
}