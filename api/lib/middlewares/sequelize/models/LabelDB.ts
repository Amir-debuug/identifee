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
  HasMany,
} from 'sequelize-typescript';
import {
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToModifyType,
  ToSequelizeModel,
} from '../types';
import { ContactDB } from './ContactDB';
import { OrganizationDB } from './OrganizationDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export const labelTypes = ['organization', 'contact'] as const;
export type LabelType = typeof labelTypes[number];

export type LabelAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @maxLength 255
   */
  name: string;
  /**
   * @maxLength 255
   */
  color: string;
  type?: LabelType | null;
  /**
   * @format uuid
   */
  assigned_user_id?: string | null;
  /**
   * @format uuid
   */
  tenant_id: string;
} & ModelTimestamp;

export type LabelCreateDAO = ToCreateType<LabelAttr, 'id', never>;
export type LabelModifyDAO = ToModifyType<LabelCreateDAO, 'tenant_id'>;

export type LabelCreateBiz = Omit<
  LabelCreateDAO,
  'tenant_id' | 'assigned_user_id'
>;
export type LabelModifyBiz = Partial<LabelCreateBiz>;

@Table({
  ...defaultModelOptions,
  tableName: 'labels',
})
export class LabelDB extends Model<
  LabelAttr,
  ToSequelizeModel<LabelCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: LabelAttr['id'];

  // TODO add tenant FK
  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: LabelAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: LabelAttr['name'];

  @AllowNull(false)
  @Column(DataType.STRING)
  color!: LabelAttr['color'];

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  assigned_user_id!: LabelAttr['assigned_user_id'];
  @BelongsTo(() => UserDB, 'assigned_user_id')
  assigned_user!: UserDB;

  @Column(DataType.ENUM(...labelTypes))
  type!: LabelAttr['type'];

  @HasMany(() => OrganizationDB, 'label_id')
  organizations!: OrganizationDB[];
  @HasMany(() => ContactDB, 'label_id')
  contacts!: ContactDB[];
}
