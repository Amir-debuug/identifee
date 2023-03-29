import jwt from 'jsonwebtoken';
import ms from 'ms';
import { nanoid } from 'nanoid';
import { totp } from 'otplib';
import { User, Session } from '../database';
import { Op } from 'sequelize';
import { userCredentialFactory, userServiceFactory } from './user';
import {
  InvalidCredentials,
  InvalidOTP,
  UserSuspended,
} from 'lib/middlewares/exception';
import { extendAs } from 'lib/middlewares/context';
import { defaultUsers } from 'lib/middlewares/auth';

const {
  ACCESS_TOKEN_TTL,
  SECRET,
  TFA_WITH_EMAIL = '',
  REFRESH_TOKEN_TTL,
  // generate 6 digits and TTL of 60 seconds
  TFA_STEP_TIME = '60',
  TFA_WINDOW = '2',
} = process.env;

totp.options = {
  digits: 6,
  step: parseInt(TFA_STEP_TIME),
  window: parseInt(TFA_WINDOW),
};

type AuthenticateOptions = {
  client_id?: string;
  username: string;
  password?: string;
  ip?: string | null;
  userAgent?: string | null;
  otp?: string;
};

export class AuthenticationService {
  /**
   * Retrieve the tokens for a given user email.
   *
   * Password is optional to allow usage of this function within the SSO flow and extensions. Make sure
   * to handle password existence checks elsewhere
   */
  async authenticate(options: AuthenticateOptions): Promise<{
    accessToken: any;
    refreshToken: any;
    expires: any;
    id?: any;
    tenant_id: string;
  }> {
    const {
      username: email,
      password,
      ip,
      userAgent,
      otp,
      client_id,
    } = options;
    const invalidCredentialsMessage =
      'Incorrect email or password. Please try again.';

    const userService = userServiceFactory({} as any);
    const user = await userService.getByEmail(email, client_id);

    if (!user || user.status !== 'active') {
      if (user?.status === 'deactivated') {
        throw new UserSuspended(
          'This account is suspended, please contact the Administrator to activate your account.'
        );
      } else {
        throw new InvalidCredentials(invalidCredentialsMessage);
      }
    }

    const credentialService = userCredentialFactory({ id: user.id } as any);
    const credential = await credentialService.getOne();
    if (!credential) {
      throw new InvalidCredentials(invalidCredentialsMessage);
    }

    if (password) {
      if (!credential.password) {
        throw new InvalidCredentials(invalidCredentialsMessage);
      }

      const validPassword = await credentialService.verifyPassword(
        credential.password,
        password
      );
      if (!validPassword) {
        throw new InvalidCredentials(invalidCredentialsMessage);
      }
    }

    // 2FA via email/SMS

    if (TFA_WITH_EMAIL !== 'false' && !otp) {
      if (!credential.tfa_secret) {
        throw new InvalidCredentials(invalidCredentialsMessage);
      }

      const code = credentialService.generateTOTP(credential.tfa_secret);
      const adminReq = await extendAs(defaultUsers.admin, {});
      await adminReq.services.biz.notification.sendEmail({
        event: 'TFA_CODE_REQUESTED',
        payload: {
          code,
        },
        subject: 'Verification Required',
        tenant_id: user.tenant_id,
        to: email,
      });

      return {
        accessToken: 'otp_enabled',
        refreshToken: 'otp_enabled',
        expires: 0,
        id: user.id,
        tenant_id: user.tenant_id,
      };
    }

    if (credential.tfa_secret && !otp) {
      throw new InvalidOTP(`"otp" is required`);
    }

    if (credential.tfa_secret && otp) {
      // Google Auth
      if (credential.tfa_secret && TFA_WITH_EMAIL === '') {
        const otpValid = await credentialService.verifyOTP(
          credential.tfa_secret,
          otp
        );
        if (!otpValid) {
          throw new InvalidOTP(`"otp" is invalid`);
        }
        // SMS or EMAIL based
      } else if (TFA_WITH_EMAIL !== '') {
        const otpValid = await credentialService.verifyTOTP(
          credential.tfa_secret,
          otp
        );
        if (!otpValid) {
          throw new InvalidOTP(`"totp" is invalid`);
        }
      }
    }

    const payload = {
      id: user.id,
      scope: 'profile',
      tenant_id: user.tenant_id,
    };

    // update last access time
    await User.update(
      { last_access: new Date() },
      { where: { id: user.id, tenant_id: user.tenant_id } }
    );

    /**
     * @TODO
     * Sign token with combination of server secret + user password hash
     * That way, old tokens are immediately invalidated whenever the user changes their password
     */
    const accessToken = jwt.sign(payload, SECRET as string, {
      expiresIn: ACCESS_TOKEN_TTL || '15m',
    });

    const refreshToken = nanoid(64);
    const refreshTokenExpiration = new Date(
      Date.now() + ms(REFRESH_TOKEN_TTL as string)
    );

    // stores session
    await Session.create({
      token: refreshToken,
      user: user.id,
      expires: refreshTokenExpiration,
      ip: ip,
      user_agent: userAgent,
      tenant_id: user.tenant_id,
    });

    await Session.destroy({
      where: {
        expires: {
          [Op.lt]: new Date(),
        },
      },
    });

    return {
      accessToken,
      refreshToken,
      expires: new Date().getTime() + ms(ACCESS_TOKEN_TTL as string),
      id: user.id,
      tenant_id: user.tenant_id,
    };
  }

  async getImpersonationToken(
    tenant: string,
    userId: string,
    impersonator: string
  ) {
    const payload = {
      id: userId,
      impersonator,
      scope: 'impersonation',
      tenant_id: tenant,
    };

    const accessToken = jwt.sign(payload, SECRET as string, {
      expiresIn: ACCESS_TOKEN_TTL || '15m',
    });

    const refreshToken = nanoid(64);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires: new Date().getTime() + ms(ACCESS_TOKEN_TTL as string),
      id: userId,
    };
  }
}
