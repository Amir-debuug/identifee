import { defaultNewModelOptions, StaticModel } from 'lib/database/helpers';
import { PipelineAttr } from 'lib/middlewares/sequelize';
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export type PipelineAttributes = PipelineAttr;
export type PipelineModifyAttributes = Optional<PipelineAttributes, 'id'>;
export type PipelineModel = Model<PipelineAttributes, PipelineModifyAttributes>;
type PipelineStatic = StaticModel<PipelineModel>;

export function PipelineRepository(sqlz: Sequelize) {
  return sqlz.define(
    'pipeline',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'pipeline',
      ...defaultNewModelOptions,
    }
  ) as PipelineStatic;
}
