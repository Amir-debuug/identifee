import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import {
  defaultModelOptions,
  Order,
  Search,
  ToCreateType,
  ModelTimestamp,
  ToModifyType,
  Self,
} from '../types';
import { GroupDB } from './GroupDB';
import { RoleDB } from './RoleDB';
import { TenantDB } from './TenantDB';
import { UserCredentialDB } from './UserCredentialDB';

export const userStatuses = [
  'active',
  'inactive',
  'suspended',
  'deleted',
  'invited',
  'deactivated',
  'invite_cancelled',
] as const;
export type UserStatus = typeof userStatuses[number];

export type UserAttrs = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  tenant_id: string;
  /**
   * @format uuid
   */
  roleId?: string | null;
  /**
   * @format uuid
   */
  groupId?: string | null;

  /**
   * @maxLength 255
   */
  first_name?: string | null;
  /**
   * @maxLength 255
   */
  last_name?: string | null;

  /**
   * @description Virtual result, `${first_name} ${last_name}`
   * @string
   */
  name?: string | null; // this is a virtual column

  /**
   * @maxLength 255
   */
  email: string; // TODO make this not null in table
  /**
   * @maxLength 255
   */
  title?: string | null;
  /**
   * @maxLength 255
   */
  avatar?: string | null;
  /**
   * @maxLength 255
   */
  status: string; // TODO define as enum and not null
  last_access?: Date | null; // TODO move this to credentials
  /**
   * @maxLength 255
   */
  last_page?: string | null;
  /**
   * @maxLength 255
   */
  phone?: string | null;
};

export type UserAttr = UserAttrs & ModelTimestamp;

export type UserCreateDAO = ToCreateType<UserAttr, 'id' | 'name', never>;
export type UserModifyDAO = ToModifyType<UserCreateDAO, 'tenant_id'>;
export type UserQueryDAO = {
  search?: Search;
  order?: Order;
  status?: UserStatus;
  excludeAdmins?: boolean;
} & Pick<UserAttr, 'roleId'> &
  Self;

// TODO status should be controlled through API, not FE
export type UserCreateBiz = Omit<UserCreateDAO, 'id' | 'tenant_id' | 'status'>;
export type UserModifyBiz = Partial<UserCreateBiz>;
export type UserQueryBiz = UserQueryDAO;

export type UserInviteBiz = {
  firstName: string;
  lastName: string;
  email: string;
  groupId: string;
  roleId: string;
};

@Table({
  ...defaultModelOptions,
  tableName: 'users',
})
export class UserDB extends Model<UserAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: UserAttr['id'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: UserAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @Column(DataType.STRING)
  first_name!: UserAttr['first_name'];

  @Column(DataType.STRING)
  last_name!: UserAttr['last_name'];

  @Column(DataType.VIRTUAL)
  get name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: UserAttr['email'];

  @Column(DataType.STRING)
  title!: UserAttr['title'];

  @Column(DataType.STRING)
  avatar!: UserAttr['avatar'];

  @Column(DataType.STRING)
  status!: UserAttr['status'];

  @Column(DataType.DATE)
  last_access!: UserAttr['last_access'];

  @Column(DataType.STRING)
  last_page!: UserAttr['last_page'];

  @Column(DataType.STRING)
  phone!: UserAttr['phone'];

  @HasOne(() => UserCredentialDB, 'user_id')
  credential!: UserCredentialDB;

  @ForeignKey(() => RoleDB)
  @Column({
    type: DataType.UUID,
    field: 'roleId',
  })
  roleId!: UserAttr['roleId'];
  @BelongsTo(() => RoleDB, 'roleId')
  role!: RoleDB;

  @ForeignKey(() => GroupDB)
  @Column({
    type: DataType.UUID,
    field: 'groupId',
  })
  groupId!: UserAttr['groupId'];
  @BelongsTo(() => GroupDB, 'groupId')
  group!: GroupDB;
}
