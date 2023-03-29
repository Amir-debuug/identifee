import {
  TenantCreateDAO,
  TenantModifyDAO,
  TenantQueryDAO,
  UserAttr,
} from 'lib/middlewares/sequelize';
import { Op } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class TenantDAO extends DAO<'TenantDB'> {
  async find(
    context: ContextQuery,
    pagination: Pagination,
    query: TenantQueryDAO
  ) {
    const { includeOwners, search, order = ['updated_at', 'DESC'] } = query;

    const builder = this.where();

    if (search) {
      builder.iLike(search, 'name', 'domain');
    }

    const include = [];
    if (includeOwners) {
      const userBuilder = this.services.dao.user.where();
      const roleBuilder = this.services.dao.role.where();

      include.push({
        association: 'users',
        where: userBuilder.build({
          status: {
            [Op.in]: ['active', 'invited'],
          },
          roleId: { [Op.ne]: null },
        }),
        include: [
          {
            association: 'role',
            // TODO attributes added just because of testing
            attributes: ['owner_access', 'app_access', 'admin_access'],
            required: false,
            where: roleBuilder.build({
              owner_access: true,
              app_access: true,
              admin_access: false,
            }),
          },
        ],
        required: false,
      });
    }

    const { count, rows } = await this.repo.findAndCountAll({
      include,
      order: [order],
      distinct: true,
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<{ users?: UserAttr[] }>(rows),
      count,
      pagination
    );
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });

    const tenant = await this.repo.findOne({
      where: builder.build(),
      include: [
        {
          association: 'dashboards',
          required: false,
        },
      ],
    });

    return this.toJSON(tenant);
  }

  async findOneByDomain(context: ContextQuery, domain: string) {
    const builder = this.where();
    builder.merge({ domain });

    const tenant = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(tenant);
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: TenantModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [tenant]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(tenant);
  }

  async createTenant(context: ContextQuery, payload: TenantCreateDAO) {
    const newTenant = await this.repo.create({
      ...payload,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.toJSON(newTenant);
  }
}
