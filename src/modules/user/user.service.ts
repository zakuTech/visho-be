import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './user.model';
import {
  RegisterResponse,
  RegisterRequest,
  RegisterResponseType,
  UserResponse,
} from './user.contract';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {}

  async register(req: RegisterRequest): Promise<RegisterResponse> {
    const existingUser = await this.userModel.findOne({
      where: { username: req.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(req.password, 10);

    const newUser = await this.userModel.create({
      user_id: uuidv4(),
      username: req.username,
      email: req.email,
      password: hashedPassword,
    });

    return newUser.toJSON();
  }

  async getUser(userId: string): Promise<UserResponse> {
    const user = await this.userModel.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
