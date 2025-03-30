import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginRequest, LoginResponse, AuthUser } from './auth.contract';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../user/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private userModel: typeof UserModel,
    private readonly jwtService: JwtService,
  ) {}

  async login(req: LoginRequest): Promise<LoginResponse> {
    const user = await this.userModel.findOne({
      where: { email: req.email },
      raw: true,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(req.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    console.log('User Data from DB:', user);
    const token = this.jwtService.sign(
      {
        user_id: user.user_id,
        username: user.username,
      },
      {
        secret: process.env.JWT_SECRET,
      },
    );

    await this.userModel.update(
      { token },
      { where: { user_id: user.user_id } },
    );

    return { message: 'Success Login', access_token: token };
  }
  async logout(userId: string) {
    await this.userModel.update(
      { token: null },
      { where: { user_id: userId } },
    );
    return { message: 'Logout Success' };
  }
}
