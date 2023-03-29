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
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToSequelizeModel,
} from '../types';
import { NaicsDB } from './NaicsDB';
import { SpSummaryDB } from './SpSummaryDB';

export type NaicsSpAttr = {
  /**
   * @pattern ^\d+$
   */
  code: string;
  /**
   * @format uuid
   */
  sp_summary_id: string;
} & ModelTimestamp;

export type NaicsSpCreateDAO = ToCreateType<NaicsSpAttr, never, never>;

@Table({
  ...defaultModelOptions,
  tableName: 'naics_sp',
})
export class NaicsSpDB extends Model<
  NaicsSpAttr,
  ToSequelizeModel<NaicsSpCreateDAO>
> {
  @ForeignKey(() => NaicsDB)
  @PrimaryKey
  @Column(DataType.STRING)
  code!: NaicsSpAttr['code'];
  @BelongsTo(() => NaicsDB, 'code')
  naics!: NaicsDB;

  @ForeignKey(() => SpSummaryDB)
  @Column(DataType.UUID)
  sp_summary_id!: NaicsSpAttr['sp_summary_id'];
  @BelongsTo(() => SpSummaryDB, 'sp_summary_id')
  sp!: SpSummaryDB;
}
