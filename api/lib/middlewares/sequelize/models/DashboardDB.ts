import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  camelModelOptions,
  Timestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';
import {
  ComponentCreateWithAssociationBiz,
  ComponentDB,
  ComponentModifyBiz,
} from './ComponentDB';
import { DashboardComponentDB } from './DashboardComponentDB';
import { OrganizationDB } from './OrganizationDB';
import { Expand } from 'lib/utils';

export const dashboardTypes = ['dashboard', 'insight'] as const;
export type DashboardType = typeof dashboardTypes[number];

export type DashboardAttr = {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  type: DashboardType;
  enabled: boolean;

  /**
   * @format uuid
   */
  organizationId?: string | null;
  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  tenantId: string;
} & Timestamp;

export type DashboardQueryDAO = {
  type?: DashboardType;
  /**
   * @format uuid
   */
  organizationId?: string;
};
export type DashboardCreateDAO = ToCreateType<DashboardAttr, 'id', 'enabled'>;
export type DashboardModifyDAO = ToModifyType<
  DashboardCreateDAO,
  'createdById' | 'tenantId' | 'organizationId'
>;

export type DashboardQueryBiz = DashboardQueryDAO;
export type DashboardCreateBiz = Expand<
  Omit<DashboardCreateDAO, 'tenantId' | 'createdById'>
>;
export type DashboardModifyBiz = { name?: string };
export type DashboardAddComponentBiz = ComponentCreateWithAssociationBiz;
export type DashboardModifyComponentBiz = {
  component?: ComponentModifyBiz;
};

export type DashboardDefaultBiz =
  | {
      type: 'insight';
      /**
       * @format uuid
       */
      organizationId: string;
    }
  | {
      type: 'dashboard';
    };

@Table({
  ...camelModelOptions,
  tableName: 'dashboard',
})
export class DashboardDB extends Model<
  DashboardAttr,
  ToSequelizeModel<DashboardCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: DashboardAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: DashboardAttr['name'];

  @AllowNull(false)
  @Column(DataType.ENUM(...dashboardTypes))
  type!: DashboardAttr['type'];

  @Default(true)
  @Column(DataType.BOOLEAN)
  enabled!: DashboardAttr['enabled'];

  @AllowNull(true)
  @ForeignKey(() => OrganizationDB)
  @Column(DataType.UUID)
  organizationId!: DashboardAttr['organizationId'];
  @BelongsTo(() => OrganizationDB, {
    foreignKey: 'organizationId',
    onDelete: 'CASCADE',
  })
  organization!: OrganizationDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  createdById!: DashboardAttr['createdById'];
  @BelongsTo(() => UserDB, 'createdById')
  createdBy!: UserDB;

  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenantId!: DashboardAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @HasMany(() => DashboardComponentDB, 'dashboardId')
  dashboardComponents!: DashboardComponentDB[];

  @BelongsToMany(() => ComponentDB, () => DashboardComponentDB, 'dashboardId')
  components!: (ComponentDB & { dashboardComponent: DashboardComponentDB })[];
}
