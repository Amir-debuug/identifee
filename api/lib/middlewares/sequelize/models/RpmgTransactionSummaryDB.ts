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
import { defaultModelOptions } from '../types';
import { RpmgTransactionDB } from './RpmgTransactionDB';
import { RpmgVerticalDB } from './RpmgVerticalDB';

export type RpmgTransactionSummaryAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  rpmg_vertical_id: string;
  /**
   * @format uuid
   */
  rpmg_transaction_id: string;

  /**
   * @description Represents a percentage value
   */
  all_card_platforms: number;
  /**
   * @description Represents a percentage value
   */
  checks: number;
  /**
   * @description Represents a percentage value
   */
  ach: number;
  /**
   * @description Represents a percentage value
   */
  wire_transfer: number;
};

@Table({
  ...defaultModelOptions,
  tableName: 'rpmg_transaction_summary',
})
export class RpmgTransactionSummaryDB extends Model<RpmgTransactionSummaryAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: RpmgTransactionSummaryAttr['id'];

  @ForeignKey(() => RpmgVerticalDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  rpmg_vertical_id!: RpmgTransactionSummaryAttr['rpmg_vertical_id'];
  @BelongsTo(() => RpmgVerticalDB, 'rpmg_vertical_id')
  vertical!: RpmgVerticalDB;

  @ForeignKey(() => RpmgTransactionDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  rpmg_transaction_id!: RpmgTransactionSummaryAttr['rpmg_transaction_id'];
  @BelongsTo(() => RpmgTransactionDB, 'rpmg_transaction_id')
  transaction!: RpmgTransactionDB;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  all_card_platforms!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  checks!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  ach!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  wire_transfer!: number;
}
