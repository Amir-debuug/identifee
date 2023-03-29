import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions } from '../types';
import { NaicsDB } from './NaicsDB';
import { RpmgSummaryDB } from './RpmgSummaryDB';
import { RpmgTransactionSummaryDB } from './RpmgTransactionSummaryDB';

export type RpmgVerticalAttr = {
  /**
   * @format uuid
   */
  id: string;

  /**
   * @maxLength 255
   */
  industry: string;

  /**
   * @maxLength 255
   */
  description: string;
};

@Table({
  ...defaultModelOptions,
  tableName: 'rpmg_vertical',
})
export class RpmgVerticalDB extends Model<RpmgVerticalAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: RpmgVerticalAttr['id'];

  @AllowNull(false)
  @Column(DataType.STRING)
  industry!: RpmgVerticalAttr['industry'];

  @Column(DataType.STRING)
  description!: RpmgVerticalAttr['description'];

  @BelongsToMany(() => NaicsDB, {
    through: 'naics_rpmg',
    otherKey: 'code',
    foreignKey: 'rpmg_vertical_id',
  })
  naics!: NaicsDB[];

  @HasOne(() => RpmgSummaryDB, 'rpmg_vertical_id')
  summary!: RpmgSummaryDB;

  @HasMany(() => RpmgTransactionSummaryDB, 'rpmg_vertical_id')
  transaction_summary!: RpmgTransactionSummaryDB[];
}
