import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
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
  AssociationRestriction,
  defaultModelOptions,
  Favorites,
  ModelTimestamp,
  Order,
  Progress,
  Search,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { CategoryDB } from './CategoryDB';
import { TenantDB } from './TenantDB';
import { CourseProgressDB } from './CourseProgressDB';
import { BadgeDB } from './BadgeDB';
import { CourseLessonDB } from './CourseLessonDB';
import { LessonDB } from './LessonDB';
import { CoursePreferenceDB } from './CoursePreferenceDB';
import { CourseContentDB } from './CourseContentDB';
import { CategoryCourseDB } from './CategoryCourseDB';

export type CourseAttrs = {
  /**
   * @format uuid
   */
  id: string;
  name?: string | null;
  description?: string | null;
  status?: string; // TODO make this an enum
  is_learning_path?: boolean;
  isPublic: boolean;
  deleted?: boolean;
  category_id?: number | null; // TODO make required in db
  badge_id?: string | null;
  tenant_id: string;
  categoryIds?: number[];
};

export type CourseAttr = CourseAttrs & ModelTimestamp;

export type CourseQueryStatusQuery = "eq 'draft'" | "eq 'published'";

export type CourseQueryDAO = {
  categoryIds?: number[];
  categoryId?: number;
  favorites?: Favorites;
  include?: ('badge' | 'category' | Includeable)[];
  order?: Order[];
  progress?: Progress;
  search?: Search;
  status?: CourseQueryStatusQuery | CourseQueryStatusQuery[];
  totalLessons?: boolean;
};
export type CourseCreateDAO = ToCreateType<CourseAttr, 'id', 'isPublic'>;
export type CourseModifyDAO = ToModifyType<CourseCreateDAO, 'tenant_id'>;

export type CourseQueryBiz = {
  favorites?: Favorites;
  lessonId?: number | number[];
  lessons?: AssociationRestriction;
  order?: Order[];
  progress?: Progress;
  search?: Search;
  status?: CourseQueryStatusQuery | CourseQueryStatusQuery[];
};
export type CourseCreateBiz = Omit<CourseCreateDAO, 'tenant_id'>;
export type CourseModifyBiz = Partial<CourseCreateBiz>;

@Table({
  ...defaultModelOptions,
  tableName: 'courses',
})
export class CourseDB extends Model<
  CourseAttr,
  ToSequelizeModel<CourseCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: CourseAttr['id'];

  @Column(DataType.STRING)
  name!: CourseAttr['name'];

  @Column(DataType.STRING)
  description!: CourseAttr['description'];

  @Column(DataType.STRING)
  status!: CourseAttr['status'];

  @Column(DataType.BOOLEAN)
  is_learning_path!: CourseAttr['is_learning_path'];

  @AllowNull(false)
  @Default(false)
  @Column({
    field: 'isPublic',
    type: DataType.BOOLEAN,
  })
  isPublic!: CourseAttr['isPublic'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  deleted!: CourseAttr['deleted'];

  @ForeignKey(() => CategoryDB)
  @Column(DataType.INTEGER)
  category_id!: CourseAttr['category_id'];
  @BelongsTo(() => CategoryDB, 'category_id')
  category!: CategoryDB;

  @ForeignKey(() => BadgeDB)
  @Column(DataType.UUID)
  badge_id!: CourseAttr['badge_id'];
  @BelongsTo(() => BadgeDB, 'badge_id')
  badge!: BadgeDB;

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: CourseAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @HasMany(() => CourseProgressDB)
  progress!: CourseProgressDB[];
  @HasMany(() => CourseLessonDB)
  courseLessons!: CourseLessonDB[];
  @HasMany(() => CoursePreferenceDB)
  preferences!: CoursePreferenceDB[];
  @HasMany(() => CourseContentDB)
  contents!: CourseContentDB[];

  @HasMany(() => CategoryCourseDB)
  categoryCourses!: CategoryCourseDB[];

  @BelongsToMany(() => LessonDB, () => CourseLessonDB, 'course_id')
  lessons!: (LessonDB & { courseLesson: CourseLessonDB })[];
}
