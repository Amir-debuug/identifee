import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
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
import { QuizQuestionCreateBiz, QuizQuestionDB } from './QuizQuestionDB';

export type QuizAttr = {
  /**
   * @format uuid
   */
  quizId: string;
  /**
   * @description The maximum number of attempts allowed for this quiz. If null, infinite attempts
   */
  maxAttempts?: number | null;
} & Timestamp;

export type QuizCreateDAO = ToCreateType<QuizAttr, 'quizId', 'maxAttempts'>;
export type QuizModifyDAO = ToModifyType<QuizCreateDAO, never>;

export type QuizCreateBiz = {
  maxAttempts?: number | null;
  questions: QuizQuestionCreateBiz[];
};
export type QuizCreateSubmissionBiz = {
  answers: {
    quizQuestionId: string;
    id: string;
  }[];
};

@Table({
  ...camelModelOptions,
  tableName: 'Quiz',
})
export class QuizDB extends Model<QuizAttr, ToSequelizeModel<QuizCreateDAO>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  quizId!: QuizAttr['quizId'];

  @AllowNull(true)
  @Column(DataType.INTEGER)
  maxAttempts!: QuizAttr['maxAttempts'];

  @HasMany(() => QuizQuestionDB)
  questions!: QuizQuestionDB[];
}
