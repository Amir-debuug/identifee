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
import { QuizDB } from './QuizDB';

export const quizQuestionTypes = ['multipleChoice'] as const;
export type QuizQuestionType = typeof quizQuestionTypes[number];

export type QuizQuestionChoice = {
  id: string;
  answer: string;
  correct: boolean;
};

export type QuizQuestionAttr = {
  /**
   * @format uuid
   */
  quizQuestionId: string;
  /**
   * @format uuid
   */
  quizId: string;

  title?: string;
  type: QuizQuestionType;
  choices: QuizQuestionChoice[];
  /**
   * @minimum 0
   */
  order: number;
} & Timestamp;

export type QuizQuestionCreateDAO = ToCreateType<
  QuizQuestionAttr,
  'quizQuestionId',
  never
>;
export type QuizQuestionModifyDAO = ToModifyType<
  QuizQuestionCreateDAO,
  'quizId'
>;

export type QuizQuestionCreateBiz = Pick<
  QuizQuestionCreateDAO,
  'type' | 'choices' | 'order' | 'title'
>;
export type QuizQuestionSubmissionBiz = {
  answers: {
    id: string;
  }[];
};

@Table({
  ...camelModelOptions,
  tableName: 'QuizQuestion',
})
export class QuizQuestionDB extends Model<
  QuizQuestionAttr,
  ToSequelizeModel<QuizQuestionCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  quizQuestionId!: QuizQuestionAttr['quizQuestionId'];

  @ForeignKey(() => QuizDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  quizId!: QuizQuestionAttr['quizId'];
  @BelongsTo(() => QuizDB, 'quizId')
  quiz!: QuizDB;

  @Column(DataType.STRING)
  title!: QuizQuestionAttr['title'];

  @AllowNull(false)
  @Column(DataType.ENUM(...quizQuestionTypes))
  type!: QuizQuestionAttr['type'];

  @AllowNull(false)
  @Column(DataType.JSON)
  choices!: QuizQuestionAttr['choices'];

  @AllowNull(false)
  @Column(DataType.INTEGER)
  order!: QuizQuestionAttr['order'];
}
