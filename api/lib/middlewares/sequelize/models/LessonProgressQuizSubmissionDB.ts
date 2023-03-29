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
import { LessonProgressDB } from './LessonProgressDB';
import { QuizSubmissionDB } from './QuizSubmissionDB';

export type LessonProgressQuizSubmissionAttr = {
  /**
   * @format uuid
   */
  lessonProgressQuizSubmissionId: string;
  lessonProgressId: number;
  /**
   * @format uuid
   */
  quizSubmissionId: string;
} & Timestamp;

export type LessonProgressQuizSubmissionCreateDAO = ToCreateType<
  LessonProgressQuizSubmissionAttr,
  'lessonProgressQuizSubmissionId',
  never
>;

@Table({
  ...camelModelOptions,
  tableName: 'LessonProgressQuizSubmission',
})
export class LessonProgressQuizSubmissionDB extends Model<
  LessonProgressQuizSubmissionAttr,
  ToSequelizeModel<LessonProgressQuizSubmissionCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  lessonProgressQuizSubmissionId!: LessonProgressQuizSubmissionAttr['lessonProgressQuizSubmissionId'];

  @ForeignKey(() => LessonProgressDB)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  lessonProgressId!: LessonProgressQuizSubmissionAttr['lessonProgressId'];
  @BelongsTo(() => LessonProgressDB)
  lessonProgress!: LessonProgressDB;

  @ForeignKey(() => QuizSubmissionDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  quizSubmissionId!: LessonProgressQuizSubmissionAttr['quizSubmissionId'];
  @BelongsTo(() => QuizSubmissionDB)
  quizSubmission!: QuizSubmissionDB;
}
