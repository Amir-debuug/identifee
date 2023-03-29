import { Biz, UserQuery } from './utils';

export class ReportBiz extends Biz {
  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const report = await this.services.dao.report.findOneById(context, id);
    if (!report) {
      throw new this.exception.ResourceNotFound('report');
    }
    return report;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    // existence check
    await this.getOneById(override, id);

    await this.services.dao.report.deleteById({}, id);
  }
}
