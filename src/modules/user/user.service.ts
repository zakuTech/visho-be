import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './user.contract';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async register(req: RegisterRequest): Promise<any> {
    const existingUser = await this.prisma.users.findFirst({
      where: { username: req.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(req.password, 10);
    const newUser = await this.prisma.users.create({
      data: {
        user_id: uuidv4(),
        username: req.username,
        email: req.email,
        password: hashedPassword,
      },
    });
    return newUser;
  }

  async getUser(userId: string): Promise<UserResponse | null> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
