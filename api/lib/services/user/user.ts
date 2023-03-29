import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';

import { User, Contact } from '../../database';
import { UserAttributes, UserModel } from '../../database/models/user';
import { PrimaryKey } from '../../types';
import { AuthenticationService } from '../authentication';
import { TenantService } from '../tenant';
import ContextQuery from '../utils/ContextQuery';
import { AuthUser } from 'lib/middlewares/auth';
import {
  Conflict,
  exception,
  Forbidden,
  InvalidPayload,
} from 'lib/middlewares/exception';
import { extendAs } from 'lib/middlewares/context';
import { UserData } from 'lib/controllers/users';

const { SUPPORT_EMAIL, EMAIL_FROM, SECRET, PUBLIC_URL } = process.env;

abstract class UserService extends ContextQuery<UserModel> {
  async getSelf() {
    const user = await this.model.findOne({
      where: {
        id: this.user.id,
      },
    });

    return user?.toJSON();
  }

  async updateSelf(
    payload: Omit<
      UserAttributes,
      'id' | 'email' | 'roleId' | 'tenant_id' | 'updated_at' | 'created_at'
    >
  ) {
    await this.model.update(payload, {
      where: { id: this.user.id, tenant_id: this.user.tenant },
    });
  }

  /**
   * TODO - sorry for this sloppy workaround. Properly refactor this later.
   */
  async getByEmail(email: string, tenantId?: string) {
    const where: { email: string; tenant_id?: string } = {
      email: email.toLocaleLowerCase(),
    };
    if (tenantId) {
      where.tenant_id = tenantId;
    }
    const user = await this.model.findOne({
      attributes: ['id', 'status', 'tenant_id', 'roleId'],
      where,
    });

    return user?.toJSON();
  }

  async getUser(userId: string, tenant_id?: string) {
    const where: any = {
      id: userId,
      ...this.getContextQuery(),
    };

    if (tenant_id) {
      where.tenant_id = tenant_id;
    }

    return await User.findOne({
      attributes: [
        'id',
        'first_name',
        'last_name',
        'email',
        'avatar',
        'status',
        'title',
        'phone',
        'tenant_id',
      ],
      where,
      include: ['role', 'group'],
    });
  }

  async updateUserById(props: any) {
    const where: WhereOptions = { id: props.id, ...this.getContextQuery() };

    const foundUser = await User.findOne({
      attributes: ['status'],
      where,
    });

    if (!foundUser) {
      throw new Forbidden();
    }

    const {
      firstName,
      lastName,
      avatar,
      status,
      roleId,
      title,
      phone,
      groupId,
    } = props;
    await User.update(
      {
        first_name: firstName,
        last_name: lastName,
        avatar,
        status,
        roleId,
        title,
        phone,
        groupId,
      },
      { where }
    );

    return { ...props };
  }

  async changeStatusById(id: string, status: string): Promise<any> {
    const where: WhereOptions = { id, ...this.getContextQuery() };

    const foundUser = await User.findOne({
      attributes: ['first_name', 'last_name', 'email', 'roleId', 'avatar'],
      where,
    });

    if (!foundUser) {
      throw new Forbidden();
    }

    await User.update({ status }, { where });

    foundUser.status = status;

    return foundUser;
  }

  async deleteAll(keys: PrimaryKey[]) {
    return await Promise.all(
      keys.map(async (key: PrimaryKey) => {
        try {
          const where: WhereOptions = { id: key, ...this.getContextQuery() };
          const foundUser = await User.findOne({ where });
          if (!foundUser) {
            throw new Forbidden();
          }

          await User.update(
            { status: 'invite_cancelled' },
            { where: { id: key, status: 'invited' } }
          );
          return { id: key, result: 'success', msg: '' };
        } catch (error: any) {
          return {
            id: key,
            result: 'failed',
            msg: error.message,
          };
        }
      })
    );
  }

  async requestPasswordReset(email: string, url: string | null) {
    const user = await User.findOne({
      attributes: ['id', 'email', 'tenant_id'],
      where: { email: email },
    });

    if (!user) {
      return;
    }

    const tenant = await TenantService.getTenantById(user.tenant_id);

    const payload = {
      email,
      scope: 'password-reset',
      id: user.id,
      tenant_id: user.tenant_id,
    };
    const token = jwt.sign(payload, SECRET as string, { expiresIn: '1d' });

    const acceptURL = url
      ? `${url}?token=${token}`
      : `${tenant.domain || PUBLIC_URL}/reset-password?token=${token}`;

    const userReq = await extendAs(this.user, {});
    await userReq.services.biz.notification.sendEmail({
      event: 'PASSWORD_RESET_REQUESTED',
      payload: {
        url: acceptURL,
        resetUrl: PUBLIC_URL + '/reset-password',
        email,
      },
      subject: 'Forgot your password on Identifee?',
      tenant_id: user.tenant_id,
      to: email,
    });
  }

  async sendEmailInvite(id: string, tenant: string, email: string) {
    const payload = {
      id,
      email: email.trim().toLocaleLowerCase(),
      scope: 'invited',
      // if super admin is inviting, then the invitee tenant should be the tenant_id
      tenant_id: tenant || this.user.tenant,
    };
    const token = jwt.sign(payload, SECRET as string, {
      expiresIn: '7d',
    });
    const tplData = await TenantService.getMailThemeData(payload.tenant_id);
    const inviteURL = tplData.projectUrl + '/sign-up';
    const acceptURL = inviteURL + '?token=' + token;

    const userReq = await extendAs(this.user, {});
    await userReq.services.biz.notification.sendEmail({
      event: 'USER_INVITED',
      payload: {
        url: acceptURL,
        email,
      },
      subject: 'Welcome to Identifee',
      tenant_id: payload.tenant_id,
      to: email,
    });
  }

  async inviteUser(
    tenant: string,
    userData: UserData,
    roleId: string,
    groupId: string
  ) {
    // TODO enforce this through index
    let user = await this.getByEmail(userData.email, tenant);

    if (user && user?.status !== 'invite_cancelled') {
      throw new Conflict(
        `There is already an account associated with this email.`
      );
    }

    if (user) {
      await User.update(
        {
          status: 'invited',
        },
        {
          where: { id: user?.id, status: 'invite_cancelled' },
        }
      );
    }

    if (!user) {
      const newUser = {
        id: uuidv4(),
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email.trim().toLocaleLowerCase(),
        roleId,
        groupId,
        status: 'invited',
        tenant_id: tenant || this.user.tenant,
      };
      try {
        user = await User.create(newUser);
      } catch (e) {
        throw new exception.Conflict(e);
      }
    }
    await this.sendEmailInvite(user.id, tenant, userData.email);
  }

  async message(name: string, email: string, message: string) {
    const regexValidateEmail =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regexValidateEmail.test(email)) {
      throw new InvalidPayload(`Invalid Email`);
    }

    const userReq = await extendAs(this.user, {});
    await userReq.services.providers.email.sendRaw(
      {},
      {
        to: SUPPORT_EMAIL || EMAIL_FROM,
        replyTo: email,
        subject: 'help center',
        text: message,
        html: `
				<div>
					<h4>${name}<${email}> </h4>
					<p>${message}</p>
				</div>
			`,
      }
    );
  }

  async impersonate(foundUser: UserAttributes) {
    const authService = new AuthenticationService();
    const tk = authService.getImpersonationToken(
      foundUser.tenant_id,
      foundUser.id,
      this.user.id
    );

    return tk;
  }

  async getMatchGuests(search: string): Promise<any> {
    const [contacts, users] = await Promise.all([
      Contact.findAndCountAll({
        where: {
          ...this.getContextQuery(),
          deleted: false,
          [Op.or]: [
            { first_name: { [Op.iLike]: `%${search}%` } },
            { last_name: { [Op.iLike]: `%${search}%` } },
            { email_work: { [Op.iLike]: `%${search}%` } },
            { email_home: { [Op.iLike]: `%${search}%` } },
          ],
        },
      }),
      User.findAndCountAll({
        where: {
          ...this.getContextQuery(),
          status: 'active',
          [Op.or]: [
            { first_name: { [Op.iLike]: `%${search}%` } },
            { last_name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        },
      }),
    ]);

    return [...contacts.rows, ...users.rows];
  }

  async getGuestByIds(ids: Array<string>) {
    const [contacts, users] = await Promise.all([
      Contact.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }),
      User.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      }),
    ]);

    return {
      contacts,
      users,
    };
  }
}

export class AdminUserService extends UserService {
  getContextQuery() {
    return {};
  }
}

export class OwnerUserService extends UserService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export class UserUserService extends UserService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export function userServiceFactory(user: AuthUser) {
  if (user?.auth?.isAdmin) {
    return new AdminUserService(User, user);
  } else if (user?.auth?.isOwner) {
    return new OwnerUserService(User, user);
  }

  return new UserUserService(User, user);
}
