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
import {
  camelModelOptions,
  Order,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type PipelineAttr = {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  global: boolean;
  tenantId: string;
  createdById: string;
};

export type PipelineQueryDAO = {
  order?: Order;
};
export type PipelineCreateDAO = ToCreateType<
  PipelineAttr,
  'id',
  'global' | 'isDefault'
>;
export type PipelineModifyDAO = ToModifyType<PipelineCreateDAO, 'tenantId'>;

export type PipelineQueryBiz = PipelineQueryDAO;
export type PipelineCreateBiz = Pick<
  PipelineCreateDAO,
  'name' | 'description' | 'global'
>;
export type PipelineModifyBiz = Partial<PipelineCreateBiz>;

@Table({
  ...camelModelOptions,
  tableName: 'pipeline',
})
export class PipelineDB extends Model<
  PipelineAttr,
  ToSequelizeModel<PipelineCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: PipelineAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: PipelineAttr['name'];

  @Column(DataType.TEXT)
  description!: PipelineAttr['description'];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault!: PipelineAttr['isDefault'];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  global!: PipelineAttr['global'];

  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenantId!: PipelineAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  createdById!: PipelineAttr['createdById'];
  @BelongsTo(() => UserDB, 'createdById')
  createdBy!: UserDB;
}
