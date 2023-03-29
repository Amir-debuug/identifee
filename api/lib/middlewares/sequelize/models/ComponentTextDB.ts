import {
  AllowNull,
  Column,
  DataType,
  Default,
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
import { Expand } from 'lib/utils';

const componentTextSources = [
  'rpmg',
  'spGlobal',
  'fasterPayments',
  'custom',
] as const;
export type ComponentTextSource = typeof componentTextSources[number];

const componentTextTypes = [
  'donut',
  'calendar',
  'percentText',
  'iconText',
  'donutSelection',
  'bar',
] as const;
export type ComponentTextType = typeof componentTextTypes[number];

export const componentTextPositions = [
  'left',
  'right',
  'center',
  'top',
  'bottom',
] as const;
export type ComponentTextPosition = typeof componentTextPositions[number];
export type ComponentTextRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query?: { [key: string]: string | boolean | number };
  /**
   * @description The key of the response that will be used as possible options. Follows format of $.path.to[].key
   */
  responseOptionKey?: string;
};

export type ComponentTextAttr = {
  /**
   * @format uuid
   */
  id: string;
  text: string;
  position?: ComponentTextPosition | null;
  icon?: string | null;
  iconLabel?: string | null;
  request?: ComponentTextRequest;
  source?: ComponentTextSource | null;
  type: ComponentTextType;
} & Timestamp;

export type ComponentTextQueryBiz = {
  source?: ComponentTextSource;
};

export type ComponentTextCreateDAO = ToCreateType<
  ComponentTextAttr,
  'id',
  never
>;
export type ComponentTextModifyDAO = ToModifyType<
  ComponentTextCreateDAO,
  never
>;

export type ComponentTextCreateBiz = Expand<ComponentTextCreateDAO>;
export type ComponentTextModifyBiz = Expand<Partial<ComponentTextCreateBiz>>;

@Table({
  ...camelModelOptions,
  tableName: 'componentText',
})
export class ComponentTextDB extends Model<
  ComponentTextAttr,
  ToSequelizeModel<ComponentTextCreateDAO>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: ComponentTextAttr['id'];

  @AllowNull(false)
  @Column(DataType.TEXT)
  text!: ComponentTextAttr['text'];

  @Column(DataType.ENUM(...componentTextPositions))
  position!: ComponentTextAttr['position'];

  @Column(DataType.STRING)
  icon!: ComponentTextAttr['icon'];

  @Column(DataType.STRING)
  iconLabel!: ComponentTextAttr['iconLabel'];

  @Column(DataType.JSON)
  request!: ComponentTextAttr['request'];

  @Column(DataType.ENUM(...componentTextSources))
  source!: ComponentTextAttr['source'];

  @AllowNull(false)
  @Column(DataType.ENUM(...componentTextTypes))
  type!: ComponentTextAttr['type'];
}
