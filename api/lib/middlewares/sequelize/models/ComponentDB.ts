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
import { AnalyticCreateBiz, AnalyticDB } from './AnalyticDB';
import {
  ComponentTextCreateBiz,
  ComponentTextDB,
  ComponentTextModifyDAO,
} from './ComponentTextDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';
import { DashboardComponentDB } from './DashboardComponentDB';
import { DashboardDB } from '.';
import { ExpandRecursively } from 'lib/utils';

export type ComponentAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @maxLength 255
   */
  name: string;
  enabled: boolean;

  // allow null in db to keep component flexible
  /**
   * @format uuid
   */
  analyticId?: string | null;
  /**
   * @format uuid
   */
  componentTextId?: string | null;

  /**
   * @format uuid
   */
  createdById: string;
  /**
   * @format uuid
   */
  tenantId: string;
} & Timestamp;

export type ComponentQueryBiz = {
  enabled?: boolean;
};

export type ComponentCreateDAO = ToCreateType<ComponentAttr, 'id', 'enabled'>;
export type ComponentModifyDAO = ToModifyType<
  ComponentCreateDAO,
  'createdById' | 'tenantId'
> & { componentText?: ComponentTextModifyDAO };

export type ComponentCreateBiz = Omit<
  ComponentCreateDAO,
  'createdById' | 'tenantId'
>;
export type ComponentModifyBiz = Pick<ComponentAttr, 'name' | 'enabled'>;

// This is just a helper type as OpenAPI needs the full expanded type
export type ComponentCreateWithAssociationBizHelper = ExpandRecursively<{
  component: Omit<ComponentCreateBiz, 'analyticId' | 'componentTextId'> & {
    /**
     * @format uuid
     */
    analyticId?: string;
    /**
     * @format uuid
     */
    componentTextId?: string;
  };
}>;
export type ComponentCreateWithAssociationBiz =
  | {
      analytic?: AnalyticCreateBiz;
      componentText?: ComponentTextCreateBiz;
    } & ComponentCreateWithAssociationBizHelper;

@Table({
  ...camelModelOptions,
  tableName: 'component',
})
export class ComponentDB extends Model<
  ComponentAttr,
  ToSequelizeModel<ComponentCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: ComponentAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: ComponentAttr['name'];

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  enabled!: ComponentAttr['enabled'];

  @AllowNull(true)
  @ForeignKey(() => AnalyticDB)
  @Column(DataType.UUID)
  analyticId!: ComponentAttr['analyticId'];
  @BelongsTo(() => AnalyticDB, 'analyticId')
  analytic!: AnalyticDB;

  @AllowNull(true)
  @ForeignKey(() => ComponentTextDB)
  @Column(DataType.UUID)
  componentTextId!: ComponentAttr['componentTextId'];
  @BelongsTo(() => ComponentTextDB, 'componentTextId')
  componentText!: ComponentTextDB;

  @AllowNull(false)
  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  createdById!: ComponentAttr['createdById'];
  @BelongsTo(() => UserDB, {
    foreignKey: 'createdById',
    onUpdate: 'CASCADE',
  })
  createdBy!: UserDB;

  @AllowNull(false)
  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenantId!: ComponentAttr['tenantId'];
  @BelongsTo(() => TenantDB, 'tenantId')
  tenant!: TenantDB;

  @HasMany(() => DashboardComponentDB, 'componentId')
  dashboardComponents!: DashboardComponentDB[];

  @BelongsToMany(() => DashboardDB, () => DashboardComponentDB, 'dashboardId')
  dashboards!: (DashboardDB & { dashboardComponent: DashboardComponentDB })[];
}
