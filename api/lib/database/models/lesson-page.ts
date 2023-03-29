import { LessonPageAttrs } from 'lib/middlewares/sequelize/models';
import { Model, ModelDefined, DataTypes, Sequelize } from 'sequelize';

export type LessonPageAttributes = LessonPageAttrs;

// You can also set multiple attributes optional at once
export interface LessonPageModel
  extends Model<LessonPageAttributes>,
    LessonPageAttributes {}

export function LessonPageRepository(
  sqlz: Sequelize
): ModelDefined<LessonPageModel, LessonPageAttributes> {
  return sqlz.define(
    'lesson_pages',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: { type: DataTypes.UUID, allowNull: false },
      title: DataTypes.STRING,
      lesson_id: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      type: DataTypes.STRING,
      quizId: { type: DataTypes.UUID, field: 'quizId' },

      qtype: DataTypes.STRING,
      qoption: DataTypes.JSON,
      order: DataTypes.INTEGER,
      contactAccessible: {
        type: DataTypes.BOOLEAN,
        field: 'contactAccessible',
        defaultValue: false,
        allowNull: false,
      },
      videoId: { type: DataTypes.UUID, allowNull: true, field: 'videoId' },
    },
    { underscored: true }
  );
}
