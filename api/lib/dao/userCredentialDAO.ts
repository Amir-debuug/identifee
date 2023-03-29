import argon2 from 'argon2';
import * as gp from 'generate-password';
import {
  UserCredentialAttr,
  UserCredentialChangePassword,
  UserCredentialModifyDAO,
} from 'lib/middlewares/sequelize';
import { authenticator, totp } from 'otplib';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class UserCredentialDAO extends DAO<'UserCredentialDB'> {
  async findOneById(context: ContextQuery, userId: string) {
    const builder = this.where();
    builder.merge({ user_id: userId });
    builder.context(context);

    const credential = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(credential);
  }

  /**
   * Upserts user credential and will also hash provided password
   */
  async upsertById(
    context: ContextQuery,
    userId: string,
    payload: UserCredentialModifyDAO
  ) {
    const data: UserCredentialAttr = {
      user_id: userId,
      password: payload.password,
    };
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }
    if (payload.generateTFASecret) {
      data.tfa_secret = this.generateTFASecret();
    }

    await this.repo.upsert(data);
  }

  /**
   * Changes the user's password.
   *
   * Keep password verification as close as possible to the database.
   */
  async changePassword(
    context: ContextQuery,
    userId: string,
    payload: UserCredentialChangePassword
  ) {
    const userCredential = await this.findOneById(context, userId);
    if (!userCredential || !userCredential.password) {
      throw new this.exception.InvalidCredentials();
    }

    const isVerified = await this.verifyPassword(
      userCredential.password,
      payload.currentPassword
    );
    if (!isVerified) {
      throw new this.exception.InvalidCredentials();
    }

    return this.upsertById(context, userId, { password: payload.newPassword });
  }

  generatePassword() {
    const generatedPassword = gp.generate({
      length: 8,
      numbers: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
      strict: true,
      exclude: '`\'"',
    });

    return generatedPassword;
  }
  generateTFASecret() {
    const tfaSecret = authenticator.generateSecret();
    return tfaSecret;
  }
  generateTOTP(tfaSecret: string) {
    return totp.generate(tfaSecret);
  }

  async hashPassword(password: string) {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string) {
    const isVerified = await argon2.verify(hash, password);
    return isVerified;
  }
}
