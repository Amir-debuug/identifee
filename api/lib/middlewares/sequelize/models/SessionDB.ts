import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions, ToCreateType, ToSequelizeModel } from '../types';
import { TenantDB } from './TenantDB';
import { UserDB } from './UserDB';

export type SessionAttr = {
  id: number;

  /**
   * @format uuid
   */
  user: string; // TODO rename to userId
  /**
   * @format uuid
   */
  tenant_id: string;
  token: string; // TODO rename to refreshToken and make it unique
  expires: Date;
  ip: string;
  user_agent: string;
};

export type SessionCreateDAO = ToCreateType<SessionAttr, 'id', never>;

@Table({
  ...defaultModelOptions,
  tableName: 'sessions',
})
export class SessionDB extends Model<
  SessionAttr,
  ToSequelizeModel<SessionCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: SessionAttr['id'];

  @ForeignKey(() => UserDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  user!: SessionAttr['user'];

  @AllowNull(false)
  @Column(DataType.STRING)
  token!: SessionAttr['token'];

  @AllowNull(false)
  @Column(DataType.DATE)
  expires!: SessionAttr['expires'];

  @AllowNull(false)
  @Column(DataType.STRING)
  ip!: SessionAttr['ip'];

  @AllowNull(false)
  @Column(DataType.STRING)
  user_agent!: SessionAttr['user_agent'];

  @ForeignKey(() => TenantDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenant_id!: SessionAttr['tenant_id'];
  @BelongsTo(() => TenantDB, 'tenant_id')
  tenant!: TenantDB;
}
