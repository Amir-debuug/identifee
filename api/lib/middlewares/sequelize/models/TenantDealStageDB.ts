import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions, camelModelOptions } from '../types';
import { PipelineDB } from './PipelineDB';

export type TenantDealStageAttrs = {
  /**
   * @format uuid
   */
  id?: string;
  name: string;
  description?: string;
  active?: boolean;
  position: number;
  probability?: number;
  /**
   * @format uuid
   */
  pipelineId: string;
};

export type TenantDealStageAttr = TenantDealStageAttrs;

export type TenantDealStageCreateDAO = Omit<TenantDealStageAttr, 'id'>;
export type TenantDealStageCreateBiz = TenantDealStageCreateDAO;

@Table({
  ...defaultModelOptions,
  ...camelModelOptions,
  tableName: 'tenant_deal_stage',
})
export class TenantDealStageDB extends Model<TenantDealStageAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: TenantDealStageAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name!: TenantDealStageAttr['name'];

  @Column(DataType.TEXT)
  description!: TenantDealStageAttr['description'];

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: TenantDealStageAttr['active'];

  @Column(DataType.INTEGER)
  position!: TenantDealStageAttr['position'];

  @Default(0)
  @Column(DataType.INTEGER)
  probability!: TenantDealStageAttr['probability'];

  @ForeignKey(() => PipelineDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  pipelineId!: TenantDealStageAttr['pipelineId'];
  @BelongsTo(() => PipelineDB, 'pipelineId')
  pipeline!: PipelineDB;
}
