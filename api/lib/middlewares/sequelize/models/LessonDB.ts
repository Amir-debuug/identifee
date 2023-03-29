import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Includeable } from 'sequelize';
import {
  defaultModelOptions,
  Favorites,
  ModelTimestamp,
  Order,
  Progress,
  Search,
  Self,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { CategoryDB } from './CategoryDB';
import { TenantDB } from './TenantDB';
import { LessonProgressDB } from './LessonProgressDB';
import { Expand } from 'lib/utils';
import { LessonPageDB } from './LessonPageDB';
import { LessonPreferenceDB } from './LessonPreferenceDB';

export type LessonAttrs = {
  id: number;
  /**
   * @maxLength 255
   */
  title: string;
  content?: string | null;
  category_id?: number | null;
  max_points?: number | null;
  max_attempts?: number | null;
  /**
   * @maxLength 255
   */
  documents?: string | null;
  duration?: number | null; // total seconds a lesson should take
  isPublic: boolean;
  /**
   * @maxLength 255
   */
  tags?: string | null;
  /**
   * @maxLength 255
   */
  icon?: string | null;
  /**
   * @maxLength 255
   */
  status?: string; // TODO make this enum
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type LessonAttr = LessonAttrs & ModelTimestamp;

export type LessonCreateDAO = ToCreateType<LessonAttr, 'id', 'isPublic'>;
export type LessonModifyDAO = ToModifyType<LessonCreateDAO, 'tenant_id'>;

export type LessonQueryStatusQuery =
  | "eq 'draft'"
  | "eq 'published'"
  | "ne 'deleted'";

export type LessonQueryDAO = {
  categoryId?: number | number[];
  favorites?: Favorites;
  include?: ('badge' | 'category' | Includeable)[];
  order?: Order[];
  progress?: Progress;
  search?: Search;
  contactAccessible?: boolean;
  status?: LessonQueryStatusQuery | LessonQueryStatusQuery[];
};

export type GetLessonsQuery = Expand<
  Pick<LessonQueryDAO, 'favorites' | 'progress' | 'search' | 'status'>
> & {
  order?: Order[]; // throws openapi error due to nested arrays..
} & Self;
export type LessonCreateBiz = Omit<LessonCreateDAO, 'tenant_id'>;
export type LessonModifyBiz = Partial<LessonCreateBiz>;

@Table({
  ...defaultModelOptions,
  tableName: 'lessons',
})
export class LessonDB extends Model<
  LessonAttr,
  ToSequelizeModel<LessonCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: LessonAttr['id'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: LessonAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: LessonAttr['title'];

  @Column(DataType.TEXT)
  content!: LessonAttr['content'];

  @ForeignKey(() => CategoryDB)
  @Column(DataType.INTEGER)
  category_id!: LessonAttr['category_id'];
  @BelongsTo(() => CategoryDB, 'category_id')
  category!: CategoryDB;

  @Column(DataType.INTEGER)
  max_points!: LessonAttr['max_points'];

  @Column(DataType.INTEGER)
  max_attempts!: LessonAttr['max_attempts'];

  @Column(DataType.STRING)
  documents!: LessonAttr['documents'];

  @Column(DataType.INTEGER)
  duration!: LessonAttr['duration'];

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'isPublic',
  })
  isPublic!: LessonAttr['isPublic'];

  @Column(DataType.STRING)
  tags!: LessonAttr['tags'];

  @Column(DataType.STRING)
  icon!: LessonAttr['icon'];

  @Column(DataType.STRING)
  status!: LessonAttr['status'];

  @HasMany(() => LessonProgressDB)
  progress!: LessonProgressDB[];
  @HasMany(() => LessonPageDB)
  pages!: LessonPageDB[];
  @HasMany(() => LessonPreferenceDB)
  preferences!: LessonPreferenceDB[];
}
