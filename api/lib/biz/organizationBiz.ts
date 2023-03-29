import { Biz, UserQuery } from './utils';

export class OrganizationBiz extends Biz {
  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const organization = await this.services.dao.organization.findOneById(
      context,
      id
    );
    if (!organization) {
      throw new this.exception.ResourceNotFound('organization');
    }

    return organization;
  }

  async getInsights(override: UserQuery | undefined, id: string) {
    const organization = await this.getOneById(override, id);

    const [sp, rpmg] = await Promise.all([
      this.services.biz.insight.sp.getOneByCode(organization.naics_code),
      this.services.biz.insight.rpmg.getOneByCode(organization.naics_code),
    ]);

    return {
      sp,
      rpmg,
    };
  }
}
