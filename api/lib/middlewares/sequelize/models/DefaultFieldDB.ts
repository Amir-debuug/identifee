import {
  Column,
  DataType,
  Default,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions, ToCreateType } from '../types';
import {
  FieldFieldType,
  fieldFieldTypes,
  FieldType,
  fieldTypes,
  FieldValueType,
  fieldValueTypes,
} from './FieldDB';

export type DefaultFieldAttr = {
  id?: string;
  key: string;
  field_type: FieldFieldType;
  value_type: FieldValueType;
  order?: number;
  type: FieldType;
  mandatory?: boolean;
  usedField?: boolean;
  isFixed?: boolean;
  columnName: string;
  isCustom?: boolean;
  section: string;
  preferred?: boolean;
};

export type DefaultFieldCreateDAO = ToCreateType<DefaultFieldAttr, 'id', never>;

export type DefaultFieldCreateBiz = DefaultFieldCreateDAO;

@Table({
  ...camelModelOptions,
  tableName: 'defaultField',
})
export class DefaultFieldDB extends Model<DefaultFieldAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: DefaultFieldAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  key!: DefaultFieldAttr['key'];

  @Column(DataType.ENUM(...fieldFieldTypes))
  field_type!: DefaultFieldAttr['field_type'];

  @Column(DataType.ENUM(...fieldValueTypes))
  value_type!: DefaultFieldAttr['value_type'];

  @Column(DataType.INTEGER)
  order!: DefaultFieldAttr['order'];

  @Column(DataType.ENUM(...fieldTypes))
  type!: DefaultFieldAttr['type'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  mandatory!: DefaultFieldAttr['mandatory'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  usedField!: DefaultFieldAttr['usedField'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  isFixed!: DefaultFieldAttr['isFixed'];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  columnName!: DefaultFieldAttr['columnName'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCustom!: DefaultFieldAttr['isCustom'];

  @AllowNull(false)
  @Column(DataType.STRING(50))
  section!: DefaultFieldAttr['section'];

  @Default(false)
  @Column(DataType.BOOLEAN)
  preferred!: DefaultFieldAttr['preferred'];
}
