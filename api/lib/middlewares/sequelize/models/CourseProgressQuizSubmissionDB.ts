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
  ToSequelizeModel,
} from '../types';
import { CourseProgressDB } from './CourseProgressDB';
import { QuizSubmissionDB } from './QuizSubmissionDB';

export type CourseProgressQuizSubmissionAttr = {
  /**
   * @format uuid
   */
  courseProgressQuizSubmissionId: string;
  courseProgressId: string;
  /**
   * @format uuid
   */
  quizSubmissionId: string;
} & Timestamp;

export type CourseProgressQuizSubmissionCreateDAO = ToCreateType<
  CourseProgressQuizSubmissionAttr,
  'courseProgressQuizSubmissionId',
  never
>;

@Table({
  ...camelModelOptions,
  tableName: 'CourseProgressQuizSubmission',
})
export class CourseProgressQuizSubmissionDB extends Model<
  CourseProgressQuizSubmissionAttr,
  ToSequelizeModel<CourseProgressQuizSubmissionCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  courseProgressQuizSubmissionId!: CourseProgressQuizSubmissionAttr['courseProgressQuizSubmissionId'];

  @ForeignKey(() => CourseProgressDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  courseProgressId!: CourseProgressQuizSubmissionAttr['courseProgressId'];
  @BelongsTo(() => CourseProgressDB)
  courseProgress!: CourseProgressDB;

  @ForeignKey(() => QuizSubmissionDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  quizSubmissionId!: CourseProgressQuizSubmissionAttr['quizSubmissionId'];
  @BelongsTo(() => QuizSubmissionDB)
  quizSubmission!: QuizSubmissionDB;
}
