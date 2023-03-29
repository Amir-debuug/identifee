import {
  GroupAttr,
  RoleAttr,
  TenantAttr,
  UserModifyDAO,
  UserQueryDAO,
} from 'lib/middlewares/sequelize';
import { TransactionOptions } from 'sequelize/types';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class UserDAO extends DAO<'UserDB'> {
  async findAllByGroupId(context: ContextQuery, groupId: string | string[]) {
    const builder = this.where();
    builder.merge({ groupId });
    builder.context(context);

    const users = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(users);
  }

  async find(
    context: ContextQuery,
    pagination: Pagination,
    query: UserQueryDAO
  ) {
    const { order = ['updated_at', 'desc'], search, status, roleId } = query;

    const builder = this.where();
    const roleBuilder = this.services.dao.role.where();

    if (status) {
      builder.merge({ status: status });
    }
    if (search) {
      const [firstNameOrEmail, lastName] = search.split(' ');

      if (firstNameOrEmail && !lastName) {
        builder.iLike(firstNameOrEmail, 'first_name', 'last_name', 'email');
      } else if (firstNameOrEmail) {
        builder.iLike(firstNameOrEmail, 'first_name', 'email');
      }
      if (lastName) {
        builder.iLike(lastName, 'last_name');
      }
    }
    if (roleId) {
      builder.merge({ roleId });
    }

    builder.context(context);

    if (query.excludeAdmins) {
      roleBuilder.merge({ admin_access: false });
    }

    const { count, rows } = await this.repo.findAndCountAll({
      include: [
        {
          association: 'role',
          where: roleBuilder.build(),
        },
        'group',
        'tenant',
      ],
      order: [order, ['created_at', 'desc']],
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<{
        tenant: TenantAttr;
        role?: RoleAttr;
        group?: GroupAttr;
      }>(rows),
      count,
      pagination
    );
  }

  async findByRole(
    context: ContextQuery,
    roleId: string,
    pagination: Pagination
  ) {
    const builder = this.where();
    builder.merge({ roleId });
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneById(context: ContextQuery, userId: string) {
    const builder = this.where();
    builder.merge({ id: userId });
    builder.context(context);

    const user = await this.repo.findOne({
      include: ['role', 'group'],
      where: builder.build(),
    });

    return this.toJSON<{ role: RoleAttr; group: GroupAttr }>(user);
  }

  async findOneByEmail(context: ContextQuery, email: string) {
    const builder = this.where();
    builder.merge({ email });
    builder.context(context);

    const user = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(user);
  }

  /**
   * Retrieves a single user but limits scope to authorization properties along
   * with the association.
   */
  async findOneAuthorizationById(context: ContextQuery, userId: string) {
    const builder = this.where();
    builder.merge({ id: userId });
    builder.context(context);

    const user = await this.repo.findOne({
      attributes: ['id', 'groupId', 'roleId'],
      include: ['group', 'role'],
      where: builder.build(),
    });

    const formattedUser = this.toJSON<{ group?: GroupAttr; role?: RoleAttr }>(
      user
    );

    if (!formattedUser) {
      return null;
    }

    return formattedUser as Pick<
      typeof formattedUser,
      'id' | 'roleId' | 'groupId' | 'group' | 'role'
    >;
  }

  async updateById(
    context: ContextQuery,
    userId: string,
    payload: UserModifyDAO,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ id: userId });
    builder.context(context);

    const [, [updatedUser]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
      ...opts,
    });

    return this.toJSON(updatedUser);
  }

  /**
   * To be used when transferring all users under one group to a new group.
   */
  async updateByGroupId(
    context: ContextQuery,
    groupId: string,
    payload: { groupId: string },
    opts: TransactionOptions
  ) {
    const builder = this.where();
    builder.merge({ groupId });
    builder.context(context);

    await this.repo.update(payload, {
      where: builder.build(),
      ...opts,
    });
  }
}
