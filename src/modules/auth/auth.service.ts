import {
  Injectable,
  BadRequestException,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
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

const OTP_EXPIRY_MINUTES = 5;
const OTP_MIN = 100000;
const OTP_MAX = 999999;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async login(req: LoginRequest): Promise<LoginResponse> {
    this.logger.info(`Login attempt for email: ${req.email}`);

    const user = await this.findUserByEmail(req.email);
    await this.validatePassword(req.password, user.password);

    const token = this.generateToken(user.user_id, user.username);

    return {
      message: 'Login successful',
      access_token: token,
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    this.logger.info(`User ${userId} logged out`);
    return { message: 'Logout successful' };
  }

  async sendOtp(
    email: string,
    verifyType: EVerifyType,
  ): Promise<{ message: string }> {
    const otpCode = this.generateOtpCode();
    const expiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES);

    await this.cleanupUnverifiedOtps(email);
    await this.createOtpRecord(email, otpCode, expiresAt);
    await this.sendOtpEmail(email, otpCode, verifyType);

    this.logger.info(`OTP sent to ${email} for ${verifyType}`);

    return { message: 'OTP sent successfully to your email' };
  }

  async verifyOtp(
    email: string,
    otpCode: string,
  ): Promise<{ message: string }> {
    const otpRecord = await this.findUnverifiedOtp(email, otpCode);

    if (isAfter(new Date(), otpRecord.expires_at)) {
      throw new BadRequestException('OTP has expired');
    }

    await this.markOtpAsVerified(otpRecord.otp_id);

    this.logger.info(`OTP verified for ${email}`);
    return { message: 'OTP verified successfully' };
  }

  async changeEmail(
    userId: string,
    newEmail: string,
    otpCode: string,
  ): Promise<{ message: string }> {
    const user = await this.findUserById(userId);

    await this.findVerifiedOtp(user.email, otpCode);
    await this.ensureEmailNotTaken(newEmail);

    await this.updateUserEmail(userId, newEmail);

    this.logger.info(`Email changed for user ${userId}`);
    return { message: 'Email changed successfully' };
  }

  async changePassword(
    email: string,
    newPassword: string,
    otpCode: string,
  ): Promise<{ message: string }> {
    const user = await this.findUserByEmail(email);

    await this.findVerifiedOtp(email, otpCode);
    await this.ensurePasswordIsDifferent(newPassword, user.password);

    const hashedPassword = await this.hashPassword(newPassword);
    await this.updateUserPassword(user.user_id, hashedPassword);

    this.logger.info(`Password changed for user ${user.user_id}`);
    return { message: 'Password changed successfully' };
  }

  private async findUserByEmail(email: string) {
    const user = await this.prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  private async findUserById(userId: string) {
    const user = await this.prisma.users.findFirst({
      where: { user_id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private generateToken(userId: string, username: string): string {
    return this.jwtService.sign({
      user_id: userId,
      username: username,
    });
  }

  private generateOtpCode(): string {
    return randomInt(OTP_MIN, OTP_MAX).toString();
  }

  private async cleanupUnverifiedOtps(email: string): Promise<void> {
    await this.prisma.userOtps.deleteMany({
      where: { email, verified: false },
    });
  }

  private async createOtpRecord(
    email: string,
    otpCode: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.userOtps.create({
      data: {
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        verified: false,
      },
    });
  }

  private async sendOtpEmail(
    email: string,
    otpCode: string,
    verifyType: EVerifyType,
  ): Promise<void> {
    const subject =
      verifyType === EVerifyType.CHANGE_EMAIL
        ? 'Verify Email Change'
        : 'Verify Password Change';

    await this.mailService.sendMail(
      email,
      subject,
      `Your verification code is: ${otpCode}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    );
  }

  private async findUnverifiedOtp(email: string, otpCode: string) {
    const otpRecord = await this.prisma.userOtps.findFirst({
      where: {
        email,
        otp_code: otpCode,
        verified: false,
      },
      orderBy: {
        expires_at: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return otpRecord;
  }

  private async findVerifiedOtp(email: string, otpCode: string) {
    const otpRecord = await this.prisma.userOtps.findFirst({
      where: {
        email,
        otp_code: otpCode,
        verified: true,
      },
      orderBy: {
        expires_at: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Verified OTP not found');
    }

    return otpRecord;
  }

  private async markOtpAsVerified(otpId: string): Promise<void> {
    await this.prisma.userOtps.update({
      where: { otp_id: otpId },
      data: { verified: true },
    });
  }

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const existingUser = await this.prisma.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }
  }

  private async ensurePasswordIsDifferent(
    newPassword: string,
    currentHashedPassword: string,
  ): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, currentHashedPassword);

    if (isSame) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private async updateUserEmail(userId: string, email: string): Promise<void> {
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { email },
    });
  }

  private async updateUserPassword(
    userId: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });
  }
}
