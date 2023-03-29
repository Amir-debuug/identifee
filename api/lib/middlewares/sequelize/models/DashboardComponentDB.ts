import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
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
import { ComponentDB } from './ComponentDB';
import { DashboardDB } from './DashboardDB';

export type DashboardComponentAttr = {
  /**
   * @format uuid
   */
  dashboardId: string;
  /**
   * @format uuid
   */
  componentId: string;
} & Timestamp;

export type DashboardComponentCreateDAO = ToCreateType<
  DashboardComponentAttr,
  never,
  never
>;
export type DashboardComponentModifyDAO = ToModifyType<
  DashboardComponentCreateDAO,
  'dashboardId' | 'componentId'
>;

@Table({
  ...camelModelOptions,
  tableName: 'dashboardComponent',
})
export class DashboardComponentDB extends Model<
  DashboardComponentAttr,
  ToSequelizeModel<DashboardComponentCreateDAO>
> {
  @ForeignKey(() => DashboardDB)
  @PrimaryKey
  @Column(DataType.UUID)
  dashboardId!: DashboardComponentAttr['dashboardId'];
  @BelongsTo(() => DashboardDB, 'dashboardId')
  dashboard!: DashboardDB;

  @ForeignKey(() => ComponentDB)
  @PrimaryKey
  @Column(DataType.UUID)
  componentId!: DashboardComponentAttr['componentId'];
  @BelongsTo(() => ComponentDB, 'componentId')
  component!: ComponentDB;
}
