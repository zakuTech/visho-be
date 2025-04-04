// import {
//   Table,
//   Column,
//   Model,
//   PrimaryKey,
//   Unique,
//   DataType,
// } from 'sequelize-typescript';

// @Table({ tableName: 'user', timestamps: false })
// export class UserModel extends Model<UserModel> {
//   @PrimaryKey
//   @Column({ type: DataType.STRING, allowNull: false })
//   user_id: string;

//   @Unique
//   @Column({ type: DataType.STRING, allowNull: false })
//   email: string;

//   @Column({ type: DataType.STRING, allowNull: false })
//   password: string;

//   @Column({ type: DataType.STRING, allowNull: false })
//   username: string;

//   @Column({ type: DataType.STRING, allowNull: true })
//   token?: string;

//   @Column({ type: DataType.STRING, allowNull: true })
//   profile_picture?: string;

//   @Column({ type: DataType.TEXT, allowNull: true })
//   bio?: string;
// }
