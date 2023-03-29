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
  ToCreateType,
  ToModifyType,
  defaultModelOptions,
  Order,
} from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

// redundant, i know but named after column
export const fieldFieldTypes = [
  'CHAR',
  'TEXT',
  'NUMBER',
  'DATE',
  'TIME',
  'CURRENCY',
  'URL',
  'CHECKBOX',
  'EMAIL',
  'PHONE',
] as const;
export type FieldFieldType = typeof fieldFieldTypes[number];

export const fieldValueTypes = [
  'number',
  'string',
  'boolean',
  'date',
  'object',
] as const;
export type FieldValueType = typeof fieldValueTypes[number];

export const fieldTypes = [
  'organization',
  'contact',
  'deal',
  'product',
  'task',
  'call',
  'event',
] as const;
export type FieldType = typeof fieldTypes[number];

export type FieldAttr = {
  id?: string;
  key: string;
  field_type: FieldFieldType;
  value_type: FieldValueType;
  order?: number;
  type: FieldType;
  tenant_id?: string;
  mandatory?: boolean;
  usedField?: boolean;
  isFixed?: boolean;
  columnName: string;
  isCustom?: boolean;
  section: string;
  preferred?: boolean;
  created_by: string;
};

export type FieldCreateDAO = ToCreateType<FieldAttr, 'id', never>;
export type FieldModifyDAO = ToModifyType<FieldCreateDAO, 'tenant_id'>;

export type FieldDefaultCreateDAO = {
  type?: FieldType;
};
export type FieldDefaultCreateBiz = FieldDefaultCreateDAO;

export type SetFieldPreference = {
  type: FieldType;
  fieldIds: string[];
};

export type FieldQueryDAO = {
  type: FieldType;
  preferred?: boolean;
  usedField?: boolean;
  order?: Order;
};

export type FieldQueryBiz = FieldQueryDAO;

export type FieldCreateBiz = FieldCreateDAO;
export type FieldModifyBiz = Partial<FieldCreateBiz>;

@Table({
  ...defaultModelOptions,
  ...camelModelOptions,
  tableName: 'field',
})
export class FieldDB extends Model<FieldAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: FieldAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  key!: FieldAttr['key'];

  @Column(DataType.ENUM(...fieldFieldTypes))
  field_type!: FieldAttr['field_type'];

  @Column(DataType.ENUM(...fieldValueTypes))
  value_type!: FieldAttr['value_type'];

  @Column(DataType.INTEGER)
  order!: FieldAttr['order'];

  @Column(DataType.ENUM(...fieldTypes))
  type!: FieldAttr['type'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  mandatory!: FieldAttr['mandatory'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  usedField!: FieldAttr['usedField'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  isFixed!: FieldAttr['isFixed'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  columnName!: FieldAttr['columnName'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCustom!: FieldAttr['isCustom'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  preferred!: FieldAttr['preferred'];

  @AllowNull(false)
  @Column(DataType.STRING(50))
  section!: FieldAttr['section'];

  @ForeignKey(() => TenantDB)
  @Column(DataType.UUID)
  tenant_id!: FieldAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;

  @ForeignKey(() => UserDB)
  @Column(DataType.UUID)
  created_by!: FieldAttr['created_by'];
  @BelongsTo(() => UserDB, 'created_by')
  createdBy!: UserDB;
}
