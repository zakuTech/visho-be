import {
  Injectable,
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginRequest, LoginResponse, EVerifyType } from './auth.contract';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { randomInt } from 'crypto';
import { addMinutes, isAfter } from 'date-fns';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async login(req: LoginRequest): Promise<LoginResponse> {
    try {
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
    } catch (error) {
      this.logger.error(`LOGIN FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async logout(userId: string) {
    try {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { token: null },
      });
      return { message: 'Logout Success' };
    } catch (error) {
      this.logger.error(`LOGOUT FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async sendOtp(email: string, verifyType: EVerifyType) {
    try {
      const otpCode = randomInt(100000, 999999).toString();
      const expiresAt = addMinutes(new Date(), 5);

      await this.prisma.userOtps.deleteMany({
        where: { email, verified: false },
      });

      await this.prisma.userOtps.create({
        data: {
          email,
          otp_code: otpCode,
          expires_at: expiresAt,
          verified: false,
        },
      });

      await this.mailService.sendMail(
        email,
        `Verify to continue change your ${verifyType === EVerifyType.CHANGE_EMAIL ? 'email' : 'password'} `,
        `Your OTP is: ${otpCode}`,
      );
      return { message: 'OTP sent successfully', otp: otpCode };
    } catch (error) {
      this.logger.error(`OTP FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getOtp(email: string) {
    try {
      const otpRecord = await this.prisma.userOtps.findFirst({
        where: {
          email,
          verified: false,
        },
        orderBy: {
          expires_at: 'desc',
        },
      });

      if (!otpRecord) throw new BadRequestException('OTP not found');
      return { otp: otpRecord.otp_code };
    } catch (error) {
      this.logger.error(`OTP FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyOtp(email: string, otpCode: string) {
    try {
      const otpRecord = await this.prisma.userOtps.findFirst({
        where: {
          email,
          otp_code: otpCode,
          verified: false,
        },
      });

      if (!otpRecord) throw new BadRequestException('Invalid OTP');
      if (isAfter(new Date(), otpRecord.expires_at)) {
        throw new BadRequestException('OTP expired');
      }

      await this.prisma.userOtps.update({
        where: { otp_id: otpRecord.otp_id },
        data: { verified: true },
      });

      return { message: 'OTP verified successfully' };
    } catch (error) {
      this.logger.error(`VERIFY OTP FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async changeEmail(userId: string, email: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: { user_id: userId },
      });

      if (!user) throw new BadRequestException('User not found');

      const isEmailAlreadyUsed = await this.prisma.users.findFirst({
        where: { email },
      });

      if (isEmailAlreadyUsed)
        throw new BadRequestException('Email already used');

      await this.prisma.users.update({
        where: { user_id: userId },
        data: { email },
      });

      return { message: 'Change Email Success' };
    } catch (error) {
      this.logger.error(`CHANGE EMAIL FAILED: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async changePassword(email: string, password: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: { email },
      });

      if (!user) throw new BadRequestException('User not found');

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch)
        throw new BadRequestException('Password cannot same as old password');

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.users.update({
        where: { user_id: user.user_id },
        data: { password: hashedPassword },
      });

      return { message: 'Change Password Success' };
    } catch (error) {
      this.logger.error(
        `CHANGE PASSWORD FAILED: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
