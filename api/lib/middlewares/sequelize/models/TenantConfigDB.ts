import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions, ToCreateType, ToSequelizeModel } from '../types';
import { TenantDB } from './TenantDB';

type TenantConfigQuiz = {
  maxPoints: number;
  maxAttempts: number;
  passingScore: number;
};

export type TenantConfigAttr = {
  tenantId: string;
  quiz: TenantConfigQuiz;
};

export type TenantConfigCreateDAO = ToCreateType<
  TenantConfigAttr,
  'tenantId',
  never
>;

export type TenantConfigModifyDAO = TenantConfigCreateDAO;

export type TenantConfigCreateBiz = Omit<TenantConfigCreateDAO, 'tenantId'>;
export type TenantConfigModifyBiz = TenantConfigCreateBiz;

@Table({
  ...camelModelOptions,
  tableName: 'TenantConfig',
})
export class TenantConfigDB extends Model<
  TenantConfigAttr,
  ToSequelizeModel<TenantConfigAttr>
> {
  @PrimaryKey
  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenantId!: TenantConfigAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @AllowNull(false)
  @Column(DataType.JSON)
  quiz!: TenantConfigAttr['quiz'];
}
