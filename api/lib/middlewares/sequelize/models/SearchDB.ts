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
import { camelModelOptions, ToCreateType, ToModifyType } from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type SearchAttr = {
  id?: string;
  type: string;
  name: string;
  value: string;
  userId: string;
  tenantId: string;
};

const searchTypes = ['organization', 'people', 'domain'] as const;
export type SearchType = typeof searchTypes[number];

export type SearchCreateDAO = ToCreateType<SearchAttr, 'id', never>;
export type SearchModifyDAO = ToModifyType<SearchCreateDAO, 'tenantId'>;

export type SearchCreateBiz = Pick<SearchCreateDAO, 'name' | 'type' | 'value'>;
export type SearchModifyBiz = Partial<SearchCreateBiz>;

@Table({
  ...camelModelOptions,
  tableName: 'search',
})
export class SearchDB extends Model<SearchAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: SearchAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: SearchAttr['name'];

  @AllowNull(false)
  @Column(DataType.ENUM(...searchTypes))
  type!: SearchAttr['type'];

  @AllowNull(false)
  @Column(DataType.TEXT)
  value!: SearchAttr['value'];

  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenantId!: SearchAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  userId!: SearchAttr['userId'];
  @BelongsTo(() => UserDB, 'userId')
  user!: UserDB;
}
