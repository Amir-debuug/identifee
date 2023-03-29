import {
  UserCredentialChangePassword,
  UserCredentialResetPasswordBiz,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

const { TFA_ENABLED } = process.env;

export class UserCredentialBiz extends Biz {
  async getOneById(override: UserQuery | undefined, userId: string) {
    const context = await this.userQuery.build(override);

    await this.services.biz.user.getOneById(context, userId);

    const credential = await this.services.dao.userCredential.findOneById(
      context,
      userId
    );
    // shouldn't happen
    if (!credential) {
      throw new this.exception.ResourceNotFound('UserCredential');
    }
    return credential;
  }

  async changePassword(
    override: UserQuery | undefined,
    userId: string,
    payload: UserCredentialChangePassword
  ) {
    // may need to revisit this. how does context relate to userId?
    const context = await this.userQuery.build(override);

    await this.services.dao.userCredential.changePassword(
      context,
      userId,
      payload
    );
  }

  /**
   * Use this in situations where you can't provide the user's current password:
   * - Forgot password
   * - or, admin reset password
   */
  async resetPasswordById(
    override: UserQuery | undefined,
    userId: string,
    payload: UserCredentialResetPasswordBiz
  ) {
    // may need to revisit this. how does context relate to userId?
    const context = await this.userQuery.build(override);

    const user = await this.services.biz.user.getOneById(context, userId);

    // feels iffy placing this here but we need to send the event...
    let password;
    if ('password' in payload) {
      password = payload.password;
    } else {
      password = this.services.dao.userCredential.generatePassword();
    }

    await this.services.dao.userCredential.upsertById(context, userId, {
      ...payload,
      password,
      generateTFASecret: user.status === 'invited' && TFA_ENABLED === 'true',
    });

    // user is resetting their own password
    if (override?.self) {
      // need a better way for this
      if (user.status === 'invited') {
        await this.services.data.user.updateSelf({
          status: 'active',
        });
      }

      await this.emitter.emitAppEvent(
        this.user,
        {
          event: 'PASSWORD_RESET',
          payload: {
            email: user.email,
          },
        },
        this.otel
      );
    } else {
      await this.emitter.emitAppEvent(
        this.user,
        {
          event: 'PASSWORD_CHANGED',
          payload: {
            email: user.email,
            password,
            tenantId: user.tenant_id,
          },
        },
        this.otel
      );
    }
  }
}
