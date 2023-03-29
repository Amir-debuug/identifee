import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { LessonDB } from './LessonDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export const lessonProgressStatuses = [
  'in_progress',
  'completed',
  'failed',
  'pending',
] as const;
export type LessonProgressStatus = typeof lessonProgressStatuses[number];

export type LessonProgressAttrs = {
  id: number;

  status: LessonProgressStatus; // pending - is for favorites
  started_at?: Date;
  completed_at?: Date | null;
  last_attempted_at: Date;
  progress?: number | null; // should be calculated on backend
  points?: number | null; // dependent on quiz scores
  score?: number | null;

  page_id?: number | null; // current page

  lesson_id: number; // TODO should be required in db
  /**
   * @format uuid
   */
  user_id: string; // TODO should be required in db
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type LessonProgressAttr = LessonProgressAttrs & ModelTimestamp;

export type LessonProgressCreateDAO = ToCreateType<
  LessonProgressAttr,
  'id',
  never
>;
export type LessonProgressModifyDAO = ToModifyType<
  LessonProgressCreateDAO,
  'tenant_id' | 'user_id'
>;

export type LessonProgressUpsertBiz = {
  /**
   * When `null`, it will indicate user has requested a new lesson if user
   * has completed a previous lesson.
   */
  page_id: number | null;
};

@Table({
  ...defaultModelOptions,
  tableName: 'lesson_trackings',
})
export class LessonProgressDB extends Model<
  LessonProgressAttr,
  ToSequelizeModel<LessonProgressCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: LessonProgressAttr['id'];

  @Column(DataType.ENUM(...lessonProgressStatuses))
  status!: LessonProgressAttr['status'];

  @Column(DataType.DATE)
  started_at!: LessonProgressAttr['started_at'];

  @Column(DataType.DATE)
  completed_at!: LessonProgressAttr['completed_at'];

  @Column(DataType.DATE)
  last_attempted_at!: LessonProgressAttr['last_attempted_at'];

  @Column(DataType.DECIMAL(10, 2))
  progress!: LessonProgressAttr['progress'];

  @Column(DataType.DECIMAL(10, 2))
  points!: LessonProgressAttr['points'];

  @Column(DataType.DECIMAL(10, 2))
  score!: LessonProgressAttr['score'];

  @Column(DataType.INTEGER)
  page_id!: LessonProgressAttr['page_id'];

  @ForeignKey(() => LessonDB)
  @Column(DataType.INTEGER)
  lesson_id!: LessonProgressAttr['lesson_id'];
  @BelongsTo(() => LessonDB, 'lesson_id')
  lesson!: LessonDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  user_id!: LessonProgressAttr['user_id'];
  @BelongsTo(() => UserDB, 'user_id')
  user!: UserDB;

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: LessonProgressAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;
}
