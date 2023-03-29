import {
  ContactImportBiz,
  ContactImportQuery,
  OrganizationImportDAO,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class ContactBiz extends Biz {
  async getAllByEmail(override: UserQuery | undefined, email: string) {
    const context = await this.userQuery.build(override);

    const contacts = await this.services.dao.contact.findAllByEmail(
      context,
      email
    );

    return contacts;
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.tenantQuery.build(override);

    const contact = await this.services.dao.contact.findOneById(context, id);
    if (!contact) {
      throw new this.exception.ResourceNotFound('contact');
    }

    return contact;
  }

  async bulkImport(
    override: UserQuery | undefined,
    payloads: ContactImportBiz[],
    opts: ContactImportQuery
  ) {
    const context = await this.tenantQuery.build(override);

    const defaultPayload = {
      tenant_id: context.tenantId,
      assigned_user_id: this.user.id,
      created_by: this.user.id,
      modified_user_id: this.user.id,
    };

    const { organizations } = await this.services.dao.organization.bulkImport(
      context,
      payloads
        .filter(({ organization }) => !!organization)
        .map(
          ({ organization }) =>
            ({
              ...organization,
              ...defaultPayload,
            } as OrganizationImportDAO)
        )
        .filter((organization): organization is OrganizationImportDAO => {
          return !!organization;
        }),
      opts
    );

    const contactImports = await this.services.dao.contact.bulkImport(
      context,
      payloads.map(({ organization, ...rest }) => {
        const item = {
          ...defaultPayload,
          ...rest,
        };
        if (!organization) {
          return item;
        }

        const existingOrganization = organizations.find(
          ({ name }) => name === organization.name
        );
        if (!existingOrganization) {
          return item;
        }

        return {
          ...item,
          organization_id: existingOrganization.id,
        };
      }),
      opts
    );

    return {
      ...contactImports,
      totalItems: contactImports.contacts.length,
    };
  }
}
