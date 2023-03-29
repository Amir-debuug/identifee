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
  Default,
} from 'sequelize-typescript';
import { TenantDB } from './TenantDB';
import { LessonDB } from './LessonDB';
import {
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { VideoDB } from './VideoDB';
import { QuizDB } from './QuizDB';
import { ExpandRecursively } from 'lib/utils';

export const lessonPageTypes = [
  'video',
  'quiz',
  'slide',
  'quiz_review',
] as const;
export type LessonPageType = typeof lessonPageTypes[number];

export type LessonPageAttrs = {
  id: number;
  type: LessonPageType; // TODO make this required in db
  title?: string;
  content?: string | null;
  order?: number;
  videoId?: string | null;

  /**
   * @format uuid
   */
  quizId?: string | null;

  // TODO drop these
  // qtype?: string;
  // qoption?: '';

  contactAccessible: boolean;
  lesson_id: number; // TODO make this required in db and FK
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type LessonPageAttr = LessonPageAttrs & ModelTimestamp;

export type LessonPageCreateDAO = ToCreateType<
  LessonPageAttr,
  'id',
  'contactAccessible'
>;
export type LessonPageModifyDAO = ToModifyType<
  LessonPageCreateDAO,
  'tenant_id'
>;

export type LessonUpsertBiz = ExpandRecursively<{
  pages: (Omit<LessonPageCreateDAO, 'id' | 'tenant_id'> & { id?: number })[];
}>;

@Table({
  ...defaultModelOptions,
  tableName: 'lesson_pages',
})
export class LessonPageDB extends Model<
  LessonPageAttr,
  ToSequelizeModel<LessonPageCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: LessonPageAttr['id'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: LessonPageAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @Column(DataType.STRING)
  title!: LessonPageAttr['title'];

  @ForeignKey(() => LessonDB)
  @Column(DataType.INTEGER)
  lesson_id!: LessonPageAttr['lesson_id'];
  @BelongsTo(() => LessonDB, 'lesson_id')
  lesson!: LessonDB;

  @Column(DataType.TEXT)
  content!: LessonPageAttr['content'];

  @Column(DataType.STRING)
  type!: LessonPageAttr['type'];

  @ForeignKey(() => QuizDB)
  @Column({
    type: DataType.UUID,
    field: 'quizId',
  })
  quizId!: LessonPageAttr['quizId'];
  @BelongsTo(() => QuizDB, 'quizId')
  quiz!: QuizDB;

  @Column(DataType.INTEGER)
  order!: LessonPageAttr['order'];

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'contactAccessible',
    type: DataType.BOOLEAN,
  })
  contactAccessible!: LessonPageAttr['contactAccessible'];

  @ForeignKey(() => VideoDB)
  @Column({
    field: 'videoId',
    type: DataType.UUID,
  })
  videoId!: LessonPageAttr['videoId'];
  @BelongsTo(() => VideoDB, 'videoId')
  video!: VideoDB;
}
