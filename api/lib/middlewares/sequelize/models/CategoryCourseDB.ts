import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
} from 'sequelize-typescript';
import { CourseDB } from './CourseDB';
import { CategoryDB } from './CategoryDB';

export type CategoryCourseAttr = {
  courseId: string;
  categoryId: number;
};

export type CategoryCourseCreateDAO = CategoryCourseAttr;
export type CategoryCourseCreateBiz = CategoryCourseCreateDAO;

@Table({
  tableName: 'CategoryCourse',
})
export class CategoryCourseDB extends Model<CategoryCourseAttr> {
  @PrimaryKey
  @ForeignKey(() => CourseDB)
  @Column(DataType.UUID)
  courseId!: CategoryCourseAttr['courseId'];
  @BelongsTo(() => CourseDB, 'courseId')
  course!: CourseDB;

  @PrimaryKey
  @ForeignKey(() => CategoryDB)
  @Column(DataType.INTEGER)
  categoryId!: CategoryCourseAttr['categoryId'];
  @BelongsTo(() => CategoryDB, 'categoryId')
  category!: CategoryDB;
}
