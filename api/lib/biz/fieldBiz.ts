import {
  FieldCreateBiz,
  FieldQueryBiz,
  FieldModifyBiz,
  FieldDefaultCreateBiz,
} from 'lib/middlewares/sequelize';
import { Pagination } from 'lib/types';
import { Biz } from './utils';
import { TenantQuery } from './utils/ContextQuery';

export class FieldBiz extends Biz {
  async createDefault(
    override: TenantQuery | undefined,
    payload?: FieldDefaultCreateBiz
  ) {
    const context = await this.tenantQuery.build(override);

    let defaultFields;

    if (payload?.type) {
      defaultFields = await this.services.dao.defaultField.getAll(payload.type);
    } else {
      defaultFields = await this.services.dao.defaultField.getAll(undefined);
    }

    const fieldPayloads = defaultFields.map((defaultField) => {
      return {
        key: defaultField.key,
        field_type: defaultField.field_type,
        value_type: defaultField.value_type,
        order: defaultField.order || 100,
        type: defaultField.type,
        mandatory: defaultField.mandatory,
        usedField: defaultField.usedField,
        isFixed: defaultField.isFixed,
        columnName: defaultField.columnName,
        isCustom: defaultField.isCustom,
        preferred: defaultField.preferred,
        section: defaultField.section,
        created_by: this.user.id,
        tenant_id: context.tenantId,
      };
    });

    return this.services.dao.field.bulkCreate(fieldPayloads);
  }

  async get(
    override: TenantQuery | undefined,
    pagination: Pagination,
    options: FieldQueryBiz
  ) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.field.find(context, pagination, options);
  }

  async create(override: TenantQuery | undefined, payload: FieldCreateBiz) {
    const context = await this.tenantQuery.build(override);

    if (!payload.order) {
      payload.order = 100;
    }

    return this.services.dao.field.create(context, {
      ...payload,
      tenant_id: context.tenantId,
    });
  }

  async getOneById(override: TenantQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const field = await this.services.dao.field.findOneById(context, id);
    if (!field) {
      throw new this.exception.ResourceNotFound('field');
    }
    return field;
  }

  async deleteById(override: TenantQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);
    await this.services.dao.field.deleteById(context, id);

    return;
  }

  async updateById(
    override: TenantQuery | undefined,
    id: string,
    payload: FieldModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const field = await this.services.dao.field.updateById(
      context,
      id,
      payload
    );
    if (!field) {
      throw new this.exception.ResourceNotFound('field');
    }
    return field;
  }

  async setPreferences(
    override: TenantQuery | undefined,
    type: string,
    fieldIds: string[]
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.field.setPreference(context, type, fieldIds);
  }
}
