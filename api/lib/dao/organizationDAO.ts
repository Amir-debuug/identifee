import {
  OrganizationAttr,
  OrganizationCreateDAO,
  OrganizationImportDAO,
  OrganizationImportQuery,
  OrganizationModifyDAO,
} from 'lib/middlewares/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class OrganizationDAO extends DAO<'OrganizationDB'> {
  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const organization = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(organization);
  }

  async create(context: ContextQuery, payload: OrganizationCreateDAO) {
    const organization = await this.repo.create(payload);

    return this.toJSON(organization)!;
  }

  async updateById(
    context: ContextQuery,
    id: string | string[],
    payload: OrganizationModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [organization]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });

    return this.toJSON(organization);
  }

  async restoreById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [organization]] = await this.repo.update(
      { deleted: false },
      {
        where: builder.build(),
        returning: true,
      }
    );

    return this.toJSON(organization);
  }

  async bulkImport(
    context: ContextQuery,
    payloads: OrganizationImportDAO[],
    opts: OrganizationImportQuery
  ) {
    // dedupe organization.name
    const organizationNameMap = payloads.reduce((acc, organization) => {
      if (!acc[organization.name]) {
        acc[organization.name] = {
          deleted: false,
          tenant_id: organization.tenant_id,
        };
      }
      return acc;
    }, {} as { [key: string]: { tenant_id: string; id?: string | null; deleted: boolean } });
    await Promise.all(
      Object.entries(organizationNameMap).map(async ([name, { tenant_id }]) => {
        const where = this.where();
        const organizaiton = await this.repo.findOne({
          where: where.build({
            name: Sequelize.where(
              Sequelize.fn('lower', Sequelize.col('name')),
              name.toLowerCase()
            ),
            tenant_id,
          }),
        });

        if (organizaiton) {
          organizationNameMap[name].deleted = organizaiton.deleted;
          organizationNameMap[name].id = organizaiton.id;
        }
      })
    );

    const defaultPayload = {
      date_entered: new Date(),
      date_modified: new Date(),
    };
    const errors: OrganizationAttr[] = [];
    const organizations = await Promise.all(
      payloads.map(async (payload) => {
        const item = {
          ...defaultPayload,
          ...payload,
        };

        try {
          // existing organization
          const organization = organizationNameMap[payload.name];

          if (!organization || !organization.id) {
            return this.create(context, item);
          }

          if (organization.deleted) {
            const updatedOrganization = await this.restoreById(
              context,
              organization.id
            );
            return updatedOrganization!;
          }
          if (opts.updateExisting) {
            const updatedOrganization = await this.updateById(
              context,
              organization.id,
              item
            );
            return updatedOrganization!;
          }
        } catch (error) {
          errors.push(error);
        }
      })
    );

    return {
      itemsFailed: errors,
      organizations: organizations.filter(
        (item) => item !== null
      ) as OrganizationAttr[],
    };
  }
}
