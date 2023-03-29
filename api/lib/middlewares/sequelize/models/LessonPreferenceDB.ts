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
import { LessonDB } from './LessonDB';
import { UserDB } from './UserDB';

export type LessonPreferenceAttr = {
  lessonId: number;
  /**
   * @format uuid
   */
  userId: string;

  isFavorite: boolean;
} & Timestamp;

export type LessonPreferenceCreateDAO = ToCreateType<
  LessonPreferenceAttr,
  never,
  'isFavorite'
>;
export type LessonPreferenceModifyDAO = ToModifyType<
  LessonPreferenceCreateDAO,
  'lessonId' | 'userId'
>;

@Table({
  ...camelModelOptions,
  tableName: 'LessonPreference',
})
export class LessonPreferenceDB extends Model<
  LessonPreferenceAttr,
  ToSequelizeModel<LessonPreferenceCreateDAO>
> {
  @ForeignKey(() => LessonDB)
  @PrimaryKey
  @Column(DataType.INTEGER)
  lessonId!: LessonPreferenceAttr['lessonId'];
  @BelongsTo(() => LessonDB, 'lessonId')
  lesson!: LessonDB;

  @ForeignKey(() => UserDB)
  @PrimaryKey
  @Column(DataType.UUID)
  userId!: LessonPreferenceAttr['userId'];
  @BelongsTo(() => UserDB, 'userId')
  user!: UserDB;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isFavorite!: LessonPreferenceAttr['isFavorite'];
}
