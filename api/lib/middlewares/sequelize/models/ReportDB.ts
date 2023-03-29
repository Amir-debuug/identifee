/**
 * All currency number values are represented as a tenth of a cent.
 * This eliminates the need to work with floats and may make conversion easier
 *
 * e.g.: 1 = 0.001 usd = 0.1 cent
 * e.g.: $1.23 will be represented as 1230 (tenths of a cent)
 */

import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions, ModelTimestamp } from '../types';
import { FileDB } from './FileDB';
import { OrganizationDB } from './OrganizationDB';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export const reportTypes = ['TREASURY'] as const;
export type ReportType = typeof reportTypes[number];

export type ReportTreasuryService = {
  id: number; // typically index, allows mapping from output
  name: string;
  total_items: number;
  item_fee: number; // currency
  proposed_item_fee: number; // currency
};
export type ReportTreasuryInput = {
  type: 'TREASURY';
  client_name: string;
  proposed_bank_name: string;
  date: string; // ISO date string
  average_balance: number; // currency
  services: ReportTreasuryService[];
  logo_white: string;
  logo_dark: string;
};
export type ReportInput = ReportTreasuryInput;

export type ReportAttrs = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  organization_id: string;
  /**
   * @format uuid
   */
  created_by: string;
  /**
   * @format uuid
   */
  file_id?: string;
  type: ReportType;
  input: ReportInput; // input for report output generation
  month?: string; // | `${YYYY}${MM}`; TODO investigate how to dynamically create enum on openapi
  /**
   * @format uuid
   */
  tenant_id: string;
};

export type ReportAttr = ReportAttrs & ModelTimestamp;

@Table({
  ...defaultModelOptions,
  tableName: 'reports',
})
export class ReportDB extends Model<ReportAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: ReportAttr['id'];

  @ForeignKey(() => OrganizationDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  organization_id!: ReportAttr['organization_id'];
  @BelongsTo(() => OrganizationDB, 'organization_id')
  organization!: OrganizationDB;

  @ForeignKey(() => UserDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  created_by!: ReportAttr['created_by']; // TODO change this to created_by_id
  @BelongsTo(() => UserDB, 'created_by')
  user!: UserDB; // TODO change this to created_by

  @ForeignKey(() => FileDB)
  @Column(DataType.UUID)
  file_id!: ReportAttr['file_id'];

  @AllowNull(false)
  @Column(DataType.ENUM(...reportTypes))
  type!: ReportAttr['type'];

  @Column(DataType.STRING)
  month!: ReportAttr['month'];

  @AllowNull(false)
  @Column(DataType.JSON)
  input!: ReportAttr['input'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: ReportAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;
}
