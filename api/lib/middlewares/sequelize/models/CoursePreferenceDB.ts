import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  camelModelOptions,
  Timestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { CourseDB } from './CourseDB';
import { UserDB } from './UserDB';

export type CoursePreferenceAttr = {
  /**
   * @format uuid
   */
  courseId: string;
  /**
   * @format uuid
   */
  userId: string;

  isFavorite: boolean;
} & Timestamp;

export type CoursePreferenceCreateDAO = ToCreateType<
  CoursePreferenceAttr,
  never,
  'isFavorite'
>;
export type CoursePreferenceModifyDAO = ToModifyType<
  CoursePreferenceCreateDAO,
  'courseId' | 'userId'
>;

@Table({
  ...camelModelOptions,
  tableName: 'CoursePreference',
})
export class CoursePreferenceDB extends Model<
  CoursePreferenceAttr,
  ToSequelizeModel<CoursePreferenceCreateDAO>
> {
  @ForeignKey(() => CourseDB)
  @PrimaryKey
  @Column(DataType.UUID)
  courseId!: CoursePreferenceAttr['courseId'];
  @BelongsTo(() => CourseDB, 'courseId')
  course!: CourseDB;

  @ForeignKey(() => UserDB)
  @PrimaryKey
  @Column(DataType.UUID)
  userId!: CoursePreferenceAttr['userId'];
  @BelongsTo(() => UserDB, 'userId')
  user!: UserDB;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isFavorite!: CoursePreferenceAttr['isFavorite'];
}
