import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  Unique,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'like', timestamps: false })
export class LikeModel extends Model<LikeModel> {
  @PrimaryKey
  @Column({ type: DataType.STRING, allowNull: false })
  like_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  user_id: string;
}
