import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
  BelongsToMany,
} from 'sequelize-typescript';
import {
  defaultModelOptions,
  ModelTimestamp,
  ToCreateType,
  ToSequelizeModel,
} from '../types';
import { NaicsCrossReferenceDB } from './NaicsCrossReferenceDB';
import { NaicsSpDB } from './NaicsSpDB';
import { RpmgVerticalDB } from './RpmgVerticalDB';

export type NaicsAttr = {
  /**
   * @pattern ^\d+$
   */
  code: string;
  /**
   * @maxLength 255
   */
  title: string;
} & ModelTimestamp;

export type NaicsQueryDAO = {
  search?: string;
};
export type NaicsCreateDAO = ToCreateType<NaicsAttr, never, never>;

export type NaicsQueryBiz = NaicsQueryDAO;

@Table({
  ...defaultModelOptions,
  tableName: 'naics',
})
export class NaicsDB extends Model<NaicsAttr, ToSequelizeModel<NaicsAttr>> {
  @PrimaryKey
  @Column(DataType.STRING)
  code!: NaicsAttr['code'];

  @HasOne(() => NaicsSpDB, 'code')
  naics_sp!: NaicsSpDB;
  @HasMany(() => NaicsCrossReferenceDB, 'code')
  naics!: NaicsCrossReferenceDB[];
  @HasMany(() => NaicsCrossReferenceDB, 'cross_reference_code')
  naics_cross_reference!: NaicsCrossReferenceDB[];

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: NaicsAttr['title'];

  @BelongsToMany(() => RpmgVerticalDB, {
    through: 'naics_rpmg',
    otherKey: 'rpmg_vertical_id',
    foreignKey: 'code',
  })
  rpmg!: RpmgVerticalDB[];
}
