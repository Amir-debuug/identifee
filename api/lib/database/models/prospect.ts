import { defaultModelOptions, StaticModel } from 'lib/database/helpers';
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
import { PersonSchema, CompanySchema } from 'lib/services/prospects/Prospect';

export interface ProspectAttr {
  id: string;
  external_id?: string;
  company_name?: string;
  data: PersonSchema | CompanySchema;
}

export type ProspectModifyAttributes = Optional<ProspectAttr, 'id'>;
export type ProspectModel = Model<ProspectAttr, ProspectModifyAttributes>;
type ProspectStatic = StaticModel<ProspectModel>;

export function ProspectRepository(sqlz: Sequelize) {
  return sqlz.define(
    'prospect',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      external_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: 'prospect',
      ...defaultModelOptions,
    }
  ) as ProspectStatic;
}
