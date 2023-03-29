import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions } from '../types';
import { ActivityDB } from './ActivityDB';
import { UserDB } from './UserDB';

export type ActivityOwnerAttr = {
  /**
   * @format uuid
   */
  userId: string;
  /**
   * @format uuid
   */
  activityId: string;
};

export type ActivityOwnerCreateDAO = ActivityOwnerAttr;
export type ActivityOwnerCreateBiz = Omit<ActivityOwnerAttr, 'activityId'>;

@Table({
  ...camelModelOptions,
  tableName: 'ActivityOwner',
  timestamps: false,
})
export class ActivityOwnerDB extends Model<ActivityOwnerAttr> {
  @ForeignKey(() => UserDB)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: ActivityOwnerAttr['userId'];
  @BelongsTo(() => UserDB, 'userId')
  user!: UserDB;

  @ForeignKey(() => ActivityDB)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  activityId!: ActivityOwnerAttr['activityId'];
  @BelongsTo(() => ActivityDB, 'activityId')
  activity!: ActivityDB;
}
