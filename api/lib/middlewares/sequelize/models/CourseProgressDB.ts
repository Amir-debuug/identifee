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
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { CourseContentDB } from './CourseContentDB';
import { CourseDB } from './CourseDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export const courseProgressStatuses = [
  'in_progress',
  'completed',
  'failed',
] as const;
export type CourseProgressStatus = typeof courseProgressStatuses[number];

export type CourseProgressAttrs = {
  id: string;

  status: CourseProgressStatus;
  started_at?: Date;
  completed_at?: Date | null;
  last_attempted_at: Date;
  progress?: number | null;
  points?: number | null;
  score?: number | null;

  courseContentId?: string | null;

  /**
   * @format uuid
   */
  course_id: string; // TODO make required in db
  /**
   * @format uuid
   */
  user_id: string; // TODO make required in db
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type CourseProgressAttr = CourseProgressAttrs & ModelTimestamp;

export type CourseProgressCreateDAO = ToCreateType<
  CourseProgressAttr,
  'id',
  never
>;
export type CourseProgressModifyDAO = ToModifyType<
  CourseProgressCreateDAO,
  'tenant_id' | 'user_id'
>;

export type CourseProgressUpsertBiz = {
  /**
   * When `null`, it will indicate user has requested a new lesson if user
   * has completed a previous course.
   */
  courseContentId?: string | null;
};

@Table({
  ...defaultModelOptions,
  tableName: 'course_progress',
})
export class CourseProgressDB extends Model<
  CourseProgressAttr,
  ToSequelizeModel<CourseProgressCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: CourseProgressAttr['id'];

  @AllowNull(false)
  @Column(DataType.ENUM(...courseProgressStatuses))
  status!: CourseProgressAttr['status'];

  @Column(DataType.DATE)
  started_at!: CourseProgressAttr['started_at'];

  @Column(DataType.DATE)
  completed_at!: CourseProgressAttr['completed_at'];

  @Column(DataType.DATE)
  last_attempted_at!: CourseProgressAttr['last_attempted_at'];

  @Column(DataType.DECIMAL(10, 2))
  progress!: CourseProgressAttr['progress'];

  @Column(DataType.DECIMAL(10, 2))
  points!: CourseProgressAttr['points'];

  @Column(DataType.DECIMAL(10, 2))
  score!: CourseProgressAttr['score'];

  @ForeignKey(() => CourseContentDB)
  @Column({
    type: DataType.UUID,
    field: 'courseContentId',
  })
  courseContentId!: CourseProgressAttr['courseContentId'];
  @BelongsTo(() => CourseContentDB, 'courseContentId')
  content!: CourseContentDB;

  @ForeignKey(() => CourseDB)
  @Column(DataType.UUID)
  course_id!: CourseProgressAttr['course_id'];
  @BelongsTo(() => CourseDB, 'course_id')
  course!: CourseDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  user_id!: CourseProgressAttr['user_id'];
  @BelongsTo(() => UserDB)
  user!: UserDB;

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: CourseProgressAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;
}
