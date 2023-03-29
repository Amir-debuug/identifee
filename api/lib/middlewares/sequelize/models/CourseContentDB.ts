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
import { QuizCreateBiz, QuizDB } from './QuizDB';
import { TenantDB } from './TenantDB';

export type CourseContentAttr = {
  /**
   * @format uuid
   */
  courseContentId: string;
  /**
   * @format uuid
   */
  courseId: string;
  /**
   * @format uuid
   */
  quizId?: string | null;
  order: number;
  /**
   * @format uuid
   */
  tenantId: string;
} & Timestamp;

export type CourseContentCreateDAO = ToCreateType<
  CourseContentAttr,
  'courseContentId',
  'order'
>;
export type CourseContentModifyDAO = ToModifyType<
  CourseContentCreateDAO,
  'courseId' | 'tenantId'
>;

export type CourseContentCreateQuizBiz = {
  order: number;
  quiz: QuizCreateBiz;
};

@Table({
  ...camelModelOptions,
  tableName: 'CourseContent',
})
export class CourseContentDB extends Model<
  CourseContentAttr,
  ToSequelizeModel<CourseContentCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  courseContentId!: CourseContentAttr['courseContentId'];

  @ForeignKey(() => CourseDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  courseId!: CourseContentAttr['courseId'];
  @BelongsTo(() => CourseDB, 'courseId')
  course!: CourseDB;

  @ForeignKey(() => QuizDB)
  @Column(DataType.UUID)
  quizId!: CourseContentAttr['quizId'];
  @BelongsTo(() => QuizDB, 'quizId')
  quiz!: QuizDB;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  order!: CourseContentAttr['order'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenantId!: CourseContentAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;
}
