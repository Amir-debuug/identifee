import {
  Column,
  DataType,
  Default,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import {
  defaultModelOptions,
  ModelTimestamp,
  Search,
  ToCreateType,
  ToModifyType,
  Order,
} from '../types';
import { DashboardDB } from './DashboardDB';
import { UserDB } from './UserDB';

export type TenantColor = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
};

export type TenantAttrs = {
  /**
   * @format uuid
   */
  id?: string;
  name: string;
  type: string;
  domain: string;
  modules: string;
  colors: TenantColor;
  logo: string;
  icon?: string | null;
  use_logo?: boolean | null;
  description?: string | null;
  settings?: { [K: string]: any } | null; // TODO define type
};

export type TenantAttr = TenantAttrs & ModelTimestamp;

export type TenantQueryDAO = {
  search?: Search;
  order?: Order;
  includeOwners?: boolean;
};
export type TenantCreateDAO = ToCreateType<TenantAttr, 'id', never>;
export type TenantModifyDAO = ToModifyType<TenantCreateDAO, never>;

export type TenantQueryBiz = TenantQueryDAO;
export type TenantCreateBiz = TenantCreateDAO;
export type TenantModifyBiz = TenantModifyDAO;

@Table({
  ...defaultModelOptions,
  tableName: 'tenants',
})
export class TenantDB extends Model<TenantAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: TenantAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: TenantAttr['name'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  type!: TenantAttr['type'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  domain!: TenantAttr['domain'];

  @AllowNull(false)
  @Column(DataType.TEXT)
  modules!: TenantAttr['modules'];

  @AllowNull(false)
  @Column(DataType.JSON)
  colors!: TenantAttr['colors'];

  @AllowNull(false)
  @Column(DataType.TEXT)
  logo!: TenantAttr['logo'];

  @Column(DataType.TEXT)
  icon!: TenantAttr['icon'];

  @Column(DataType.BOOLEAN)
  use_logo!: TenantAttr['use_logo'];

  @Column(DataType.TEXT)
  description!: TenantAttr['description'];

  @Column(DataType.JSON)
  settings!: TenantAttr['settings'];

  @HasMany(() => UserDB, 'tenant_id')
  users!: UserDB[];

  @HasMany(() => DashboardDB, 'tenantId')
  dashboards!: DashboardDB[];
}
