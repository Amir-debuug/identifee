import { CategoryCourseAttr } from 'lib/middlewares/sequelize';
import { Model, DataTypes, Sequelize } from 'sequelize';
import { defaultNewModelOptions, StaticModel } from '../helpers';

export type CategoryCourseAttributes = CategoryCourseAttr;

export type CategoryCourseModel = Model<CategoryCourseAttributes>;

type CategoryCourseStatic = StaticModel<CategoryCourseModel>;

export function CategoryCourseRepository(sqlz: Sequelize) {
  return <CategoryCourseStatic>sqlz.define(
    'CategoryCourse',
    {
      courseId: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        field: 'courseId',
      },
      categoryId: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'categoryId',
      },
    },
    {
      tableName: 'CategoryCourse',
      ...defaultNewModelOptions,
    }
  );
}
