import { Expand, ExpandRecursively } from 'lib/utils';
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
import { defaultModelOptions, ToCreateType } from '../types';
import { RoleDB } from './RoleDB';
import { TenantDB } from './TenantDB';

export const permissionCollections = [
  'accounts',
  'activities',
  'analytics',
  'categories',
  'contacts',
  'courses',
  'dashboards',
  'deals',
  'lessons',
  'notes',
  'products',
  'prospects',
  'quizzes',
  'reports',

  'dashboard', // deprecated, replaced wth dashboards
  'insights', // deprecated, replace with analytics
] as const;
export type PermissionCollection = typeof permissionCollections[number];

export const permissionActions = [
  'view',
  'manage',
  'create',
  'edit',
  'delete',
] as const;
export type PermissionAction = typeof permissionActions[number];

export type PermissionAttr = {
  /**
   * @format uuid
   */
  role: string;
  /**
   * @maxLength 64
   */
  collection: PermissionCollection;
  /**
   * @maxLength 10
   */
  action: PermissionAction;
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type PermissionCreateDAO = ToCreateType<PermissionAttr, never, never>;

export type PermissionUpsertBiz = Expand<
  Omit<PermissionCreateDAO, 'tenant_id' | 'role'>
>;

@Table({
  ...defaultModelOptions,
  tableName: 'permissions',
  timestamps: false,
})
export class PermissionDB extends Model<PermissionAttr> {
  @PrimaryKey
  @ForeignKey(() => RoleDB)
  @Column(DataType.UUID)
  role!: PermissionAttr['role'];

  @PrimaryKey
  @Column(DataType.ENUM(...permissionCollections))
  collection!: PermissionAttr['collection'];

  @PrimaryKey
  @Column(DataType.ENUM(...permissionActions))
  action!: PermissionAttr['action'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: PermissionAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;
}

export type Permission<
  T extends PermissionCollection | 'admin' | 'owner' =
    | PermissionCollection
    | 'admin'
    | 'owner',
  U extends PermissionAction | '*' = PermissionAction | '*'
> = {
  collection: T;
  action: U;
};

export const privilegedPermissions = {
  admin: { collection: 'admin', action: '*' },
  owner: { collection: 'owner', action: '*' },
} as const;

type CollectionPermission = {
  [R in PermissionCollection]: ExpandRecursively<{
    [A in PermissionAction]: Permission<R, A>;
  }>;
};
export const collectionPermissions: CollectionPermission =
  permissionCollections.reduce((acc, permissionCollection) => {
    if (!acc[permissionCollection]) {
      (acc[permissionCollection] as any) = {};
    }

    permissionActions.forEach((permissionAction) => {
      (acc[permissionCollection][permissionAction] as any) = {
        collection: permissionCollection,
        action: permissionAction,
      };
    });

    return acc;
  }, {} as CollectionPermission);

/**
 * Permission map for easy access control lookup
 */
export type Permissions = typeof permissions;
export const permissions = {
  ...collectionPermissions,
  privileged: privilegedPermissions,
};
