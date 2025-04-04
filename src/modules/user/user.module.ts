// import { Module, forwardRef } from '@nestjs/common';
// import { SequelizeModule } from '@nestjs/sequelize';
// import { UserModel } from './user.model';
// // import { UserController } from './user.controller';
// import { UserService } from './user.service';
// import { AuthModule } from '../auth/auth.module';

// @Module({
//     imports: [
//         SequelizeModule.forFeature([UserModel]),
//         forwardRef(() => AuthModule),
//     ],
//     // controllers: [UserController],
//     providers: [UserService],
//     exports: [SequelizeModule],
// })
// export class UserModule {}