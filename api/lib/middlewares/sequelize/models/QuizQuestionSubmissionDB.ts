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
import { QuizQuestionDB } from './QuizQuestionDB';
import { QuizSubmissionDB } from './QuizSubmissionDB';
import { UserDB } from './UserDB';

export type QuizQuestionSubmissionAttr = {
  /**
   * @format uuid
   */
  quizQuestionSubmissionId: string;
  /**
   * @format uuid
   */
  userId: string;
  /**
   * @format uuid
   */
  quizSubmissionId: string;
  /**
   * @format uuid
   */
  quizQuestionId: string;

  /**
   * @description Whether the answer was correct
   */
  correct: boolean;
} & Timestamp;

export type QuizQuestionSubmissionCreateDAO = ToCreateType<
  QuizQuestionSubmissionAttr,
  'quizQuestionSubmissionId',
  never
>;

@Table({
  ...camelModelOptions,
  tableName: 'QuizQuestionSubmission',
})
export class QuizQuestionSubmissionDB extends Model<
  QuizQuestionSubmissionAttr,
  ToSequelizeModel<QuizQuestionSubmissionCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  quizQuestionSubmissionId!: QuizQuestionSubmissionAttr['quizQuestionSubmissionId'];

  @AllowNull(false)
  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  userId!: QuizQuestionSubmissionAttr['userId'];
  @BelongsTo(() => UserDB)
  user!: UserDB;

  @AllowNull(false)
  @ForeignKey(() => QuizSubmissionDB)
  @Column(DataType.UUID)
  quizSubmissionId!: QuizQuestionSubmissionAttr['quizSubmissionId'];
  @BelongsTo(() => QuizSubmissionDB)
  quizSubmission!: QuizSubmissionDB;

  @AllowNull(false)
  @ForeignKey(() => QuizQuestionDB)
  @Column(DataType.UUID)
  quizQuestionId!: QuizQuestionSubmissionAttr['quizQuestionId'];
  @BelongsTo(() => QuizQuestionDB)
  quizQuestion!: QuizQuestionDB;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  correct!: QuizQuestionSubmissionAttr['correct'];
}
