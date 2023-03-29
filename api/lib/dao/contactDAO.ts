import {
  ContactAttr,
  ContactCreateDAO,
  ContactImportDAO,
  ContactImportQuery,
  ContactModifyDAO,
  OrganizationAttr,
} from 'lib/middlewares/sequelize';
import { Expand } from 'lib/utils';
import { Sequelize } from 'sequelize-typescript';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class ContactDAO extends DAO<'ContactDB'> {
  async findAllByEmail(context: ContextQuery, email: string) {
    const builder = this.where();
    builder.or([{ email_home: email }, { email_work: email }]);
    builder.context(context);

    const contacts = await this.repo.findAll({
      include: [
        {
          association: 'organization',
        },
      ],
      where: builder.build(),
    });

    return this.rowsToJSON<{ organization: OrganizationAttr }>(contacts);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const contact = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(contact);
  }

  async create(context: ContextQuery, payload: ContactCreateDAO) {
    const contact = await this.repo.create(payload);

    return this.toJSON(contact)!;
  }

  async updateById(
    context: ContextQuery,
    id: string | string[],
    payload: ContactModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [contact]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });

    return this.toJSON(contact);
  }

  async restoreById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [contact]] = await this.repo.update(
      { deleted: false },
      {
        where: builder.build(),
        returning: true,
      }
    );

    return this.toJSON(contact);
  }

  async bulkImport(
    context: ContextQuery,
    payloads: ContactImportDAO[],
    opts: ContactImportQuery
  ) {
    const defaultPayload = {
      date_entered: new Date(),
      date_modified: new Date(),
    };

    const errors: Expand<Partial<ContactImportDAO>>[] = [];
    const contacts = await Promise.all(
      payloads.map(async (payload) => {
        const item = {
          ...payload,
          ...defaultPayload,
        };

        const where = this.where();
        if (item.external_id) {
          where.merge({
            external_id: item.external_id,
            tenant_id: item.tenant_id,
          });
        } else if (item.email_work) {
          where.merge({
            email_work: Sequelize.where(
              Sequelize.fn('lower', Sequelize.col('email_work')),
              item.email_work.toLowerCase()
            ),
            tenant_id: item.tenant_id,
          });
        } else if (item.first_name && item.last_name) {
          where.merge({
            first_name: Sequelize.where(
              Sequelize.fn('lower', Sequelize.col('first_name')),
              item.first_name.toLowerCase()
            ),
            last_name: Sequelize.where(
              Sequelize.fn('lower', Sequelize.col('last_name')),
              item.last_name.toLowerCase()
            ),
            tenant_id: item.tenant_id,
          });
        }

        let foundContact;
        if (Object.keys(where.build()).length) {
          foundContact = await this.repo.findOne({
            where: where.build(),
          });
        }

        try {
          if (!foundContact) {
            return this.create(context, item);
          }
          if (foundContact.deleted) {
            const updatedContact = await this.restoreById(
              context,
              foundContact.id
            );
            return updatedContact!;
          }
          if (opts.updateExisting) {
            const updatedContact = await this.updateById(
              context,
              foundContact.id,
              item
            );
            return updatedContact!;
          }
        } catch (error) {
          errors.push(error);
        }
      })
    );

    return {
      itemsFailed: errors,
      contacts: contacts.filter((contact) => !!contact) as ContactAttr[],
    };
  }
}
