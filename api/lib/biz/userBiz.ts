import { ContextQuery, Pagination } from 'lib/dao';
import { UserInviteBiz, UserModifyBiz, UserQueryBiz } from 'lib/middlewares/sequelize';
import { userServiceFactory } from 'lib/services';
import { Biz, UserQuery } from './utils';

export class UserBiz extends Biz {
  async getSelfContext(override: UserQuery | undefined) {
    const tenantContext = await this.userQuery.build({
      ...override,
    });

    const context: ContextQuery<'UserDB'> = tenantContext;

    return context;
  }
  async getAllByGroupId(
    override: UserQuery | undefined,
    groupId: string | string[]
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.user.findAllByGroupId(context, groupId);
  }

  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: UserQueryBiz
  ) {
    const context = await this.getSelfContext(override);

    return this.services.dao.user.find(context, pagination, query);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const user = await this.services.dao.user.findOneById(context, id);
    if (!user) {
      throw new this.exception.ResourceNotFound('user');
    }

    return user;
  }

  async getOneAuthorizationById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const user = await this.services.dao.user.findOneAuthorizationById(
      context,
      id
    );
    if (!user) {
      throw new this.exception.ResourceNotFound('user');
    }

    return user;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: UserModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const user = await this.getOneById(override, id);

    const isInvited = user.status === 'invited';
    const isChangingEmail = payload.email && user.email !== payload.email;
    if (isChangingEmail && !isInvited) {
      throw new this.exception.Conflict("unable to change active user's email");
    }

    const updatedUser = await this.services.dao.user.updateById(
      context,
      id,
      payload
    );
    // shouldn't happen as we verify through getOne above
    if (!updatedUser) {
      throw new this.exception.InternalServerError();
    }

    if (isChangingEmail && isInvited) {
      // TODO place email service into biz/dao layer..
      const service = userServiceFactory(this.user);
      await service.sendEmailInvite(
        updatedUser.id,
        updatedUser.tenant_id,
        updatedUser.email
      );
    }

    return updatedUser;
  }

  async sendInvites(
    override: UserQuery | undefined,
    payloads: UserInviteBiz[]
  ) {
    await this.userQuery.build(override);

    const service = userServiceFactory(this.user);

    await Promise.all(
      payloads.map(async (payload) => {
        const { firstName, lastName, email, roleId, groupId } = payload;

        await service.inviteUser(
          this.user.tenant,
          { firstName, lastName, email },
          roleId,
          groupId
        );
      })
    );
  }
}
