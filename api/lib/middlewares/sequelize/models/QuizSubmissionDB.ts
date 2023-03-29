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
import { QuizDB } from './QuizDB';
import { UserDB } from './UserDB';

export const quizSubmissionStatuses = ['in-progress', 'pass', 'fail'] as const;
export type QuizSubmissionStatus = typeof quizSubmissionStatuses[number];

export type QuizSubmissionAttr = {
  /**
   * @format uuid
   */
  quizSubmissionId: string;
  /**
   * @format uuid
   */
  userId: string;
  /**
   * @format uuid
   */
  quizId: string;

  /**
   * @description Score is not calculated until all questions have been answered.
   */
  score?: number | null; // percentage

  completedAt?: Date | null;
} & Timestamp;

export type QuizSubmissionCreateDAO = ToCreateType<
  QuizSubmissionAttr,
  'quizSubmissionId',
  never
>;

@Table({
  ...camelModelOptions,
  tableName: 'QuizSubmission',
})
export class QuizSubmissionDB extends Model<
  QuizSubmissionAttr,
  ToSequelizeModel<QuizSubmissionCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  quizSubmissionId!: QuizSubmissionAttr['quizSubmissionId'];

  @AllowNull(false)
  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  userId!: QuizSubmissionAttr['userId'];
  @BelongsTo(() => UserDB)
  user!: UserDB;

  @AllowNull(false)
  @ForeignKey(() => QuizDB)
  @Column(DataType.UUID)
  quizId!: QuizSubmissionAttr['quizId'];
  @BelongsTo(() => QuizDB)
  quiz!: QuizDB;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  score!: QuizSubmissionAttr['score'];

  @Column(DataType.DATE)
  completedAt!: QuizSubmissionAttr['completedAt'];
}
