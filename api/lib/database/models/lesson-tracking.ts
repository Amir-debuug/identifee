import { LessonProgressAttrs } from 'lib/middlewares/sequelize/models';
import { Model, ModelDefined, DataTypes, Sequelize } from 'sequelize';

export type LessonTrackingAttributes = LessonProgressAttrs;

export interface LessonTrackingModel
  extends Model<LessonTrackingAttributes>,
    LessonTrackingAttributes {}

export function LessonTrackingRepository(
  sqlz: Sequelize
): ModelDefined<LessonTrackingModel, LessonTrackingAttributes> {
  return sqlz.define(
    'lesson_tracking',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      started_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
      last_attempted_at: DataTypes.DATE,
      status: DataTypes.ENUM('in_progress', 'completed', 'failed', 'pending'),
      progress: DataTypes.DECIMAL(10, 2),
      page_id: DataTypes.INTEGER,
      lesson_id: DataTypes.INTEGER,
      user_id: DataTypes.STRING,
      tenant_id: { type: DataTypes.UUID, allowNull: false },
    },
    { underscored: true }
  );
}
