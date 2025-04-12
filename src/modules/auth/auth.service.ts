import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginRequest, LoginResponse } from './auth.contract';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async login(req: LoginRequest): Promise<LoginResponse> {
    this.logger.info(`START LOGIN WITH EMAIL ${req.email}`);
    const user = await this.prisma.users.findFirst({
      where: { email: req.email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(req.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const token = this.jwtService.sign(
      {
        user_id: user.user_id,
        username: user.username,
      },
      {
        secret: process.env.JWT_SECRET,
      },
    );

    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: { token: token },
    });

    return { message: 'Success Login', access_token: token };
  }
  async logout(userId: string) {
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { token: null },
    });
    return { message: 'Logout Success' };
  }
}
