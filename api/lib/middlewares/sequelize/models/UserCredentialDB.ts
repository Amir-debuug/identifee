import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  AllowNull,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { defaultModelOptions, ToModifyType } from '../types';
import { UserDB } from './UserDB';

export type UserCredentialAttr = {
  /**
   * @format uuid
   */
  user_id: string;
  password?: string; // unhashed password on input, hashed password on output
  tfa_secret?: string;
};

export type UserCredentialModifyDAO = ToModifyType<
  UserCredentialAttr,
  'user_id'
> & { generateTFASecret?: boolean };

export type UserCredentialResetPasswordDAO = {
  password: string;
  generateTFASecret?: boolean;
};

// This is generally for admins managing their users or a user forgot password
export type UserCredentialResetPasswordBiz =
  | {
      /**
       * @minLength 8
       */
      password: string;
    }
  | {
      /**
       * @description generate a new password
       */
      generate: true;
    };

// This is for a user updating their own password
export type UserCredentialChangePassword = {
  newPassword: string;
  currentPassword: string;
};
@Table({
  ...defaultModelOptions,
  tableName: 'user_credential',
  timestamps: false,
})
export class UserCredentialDB extends Model<UserCredentialAttr> {
  @PrimaryKey
  @ForeignKey(() => UserDB)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: UserCredentialAttr['user_id'];
  @BelongsTo(() => UserDB, 'user_id')
  user!: UserDB;

  @Column(DataType.STRING)
  password!: UserCredentialAttr['password'];

  @Column(DataType.STRING)
  tfa_secret!: UserCredentialAttr['tfa_secret'];
}
