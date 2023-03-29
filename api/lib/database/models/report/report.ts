import { ReportAttrs } from 'lib/middlewares/sequelize';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import {
  defaultModelOptions,
  ModelTimestamps,
  StaticModel,
} from '../../helpers';

export type ReportAttributes = ReportAttrs;

export type ReportCreateAttributes = Optional<
  ReportAttributes,
  'id' | 'file_id' | 'created_by'
>;

export type ReportUpdateAttributes = Omit<
  ReportAttributes,
  'id' | 'created_by'
>;

export type ReportModel = Model<
  ReportAttributes & ModelTimestamps,
  ReportCreateAttributes | ReportUpdateAttributes
>;

type ReportStatic = StaticModel<ReportModel>;

export function ReportRepository(sqlz: Sequelize) {
  return <ReportStatic>sqlz.define(
    'report',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      file_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('TREASURY'),
        allowNull: false,
      },
      month: {
        type: DataTypes.STRING,
      },
      input: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'report',
      ...defaultModelOptions,
    }
  );
}
