import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions } from '../types';
import { RpmgTransactionSummaryDB } from './RpmgTransactionSummaryDB';

export type RpmgTransactionAttr = {
  /**
   * @format uuid
   */
  id: string;
  name: string;
  /**
   * @description Monetary range summary. e.g. <2500, 2500-10000, >10000
   * @pattern ^[<|>]\d+|\d+-\d+$
   */
  range: string;
};

@Table({
  ...defaultModelOptions,
  tableName: 'rpmg_transaction',
})
export class RpmgTransactionDB extends Model<RpmgTransactionAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  range!: string;

  @HasMany(() => RpmgTransactionSummaryDB, 'rpmg_transaction_id')
  transaction_summary!: RpmgTransactionSummaryDB[];
}
