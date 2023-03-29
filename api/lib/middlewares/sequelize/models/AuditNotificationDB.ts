import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { camelModelOptions, ToCreateType, ToSequelizeModel } from '../types';
import { AuditDB } from './AuditDB';
import { UserDB } from './UserDB';

/**
 * This table represents users who should be notified when an audit entry
 * is created.
 */
export type AuditNotificationAttr = {
  auditNotificationId: number;
  auditId: number;
  userId: string;
  userDisplayValue: string;
  acknowledged: boolean;
};

export type AuditNotificationCreateDAO = ToCreateType<
  AuditNotificationAttr,
  'auditNotificationId',
  'acknowledged'
>;

@Table({
  ...camelModelOptions,
  tableName: 'auditNotification',
})
export class AuditNotificationDB extends Model<
  AuditNotificationAttr,
  ToSequelizeModel<AuditNotificationCreateDAO>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  auditNotificationId!: AuditNotificationAttr['auditNotificationId'];

  @ForeignKey(() => AuditDB)
  @AllowNull(false)
  @Column(DataType.BIGINT)
  auditId!: AuditNotificationAttr['auditId'];
  @BelongsTo(() => AuditDB, 'auditId')
  audit!: AuditDB;

  @ForeignKey(() => UserDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: AuditNotificationAttr['userId'];
  @BelongsTo(() => UserDB, 'userId')
  user!: UserDB;

  @AllowNull(false)
  @Column(DataType.STRING)
  userDisplayValue!: AuditNotificationAttr['userDisplayValue'];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  acknowledged!: AuditNotificationAttr['acknowledged'];
}
