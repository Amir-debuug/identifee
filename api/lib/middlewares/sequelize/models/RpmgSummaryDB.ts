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
import { RpmgVerticalDB } from './RpmgVerticalDB';

/**
 * Float was selected for currency datatype as all inserts are being manually
 * added.
 * Other option was to use a whole value representing cents.
 */
export type RpmgSummaryAttr = {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format uuid
   */
  rpmg_vertical_id: string;

  average_p_card_spending: number; // floating currency
  average_p_card_transactions: number;
  average_spending_per_transaction: number; // floating currency
  average_spending_per_mm_revenue: number; // floating currency
};

@Table({
  ...defaultModelOptions,
  tableName: 'rpmg_summary',
})
export class RpmgSummaryDB extends Model<RpmgSummaryAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: RpmgSummaryAttr['id'];

  @ForeignKey(() => RpmgVerticalDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  rpmg_vertical_id!: RpmgSummaryAttr['rpmg_vertical_id'];
  @BelongsTo(() => RpmgVerticalDB, 'rpmg_vertical_id')
  vertical!: RpmgVerticalDB;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  average_p_card_spending!: RpmgSummaryAttr['average_p_card_spending'];

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  average_p_card_transactions!: RpmgSummaryAttr['average_p_card_transactions'];

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  average_spending_per_transaction!: RpmgSummaryAttr['average_spending_per_transaction'];

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  average_spending_per_mm_revenue!: RpmgSummaryAttr['average_spending_per_mm_revenue'];
}
