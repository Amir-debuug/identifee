import { RpmgDAO } from 'lib/dao';
import { AwaitFn } from 'lib/utils';
import { InsightBiz } from './insightBiz';

type InsightRpmgOpt = {
  Upload: {
    type: 'rpmg';
    excel: {
      name: string;
    }[];
  };
  Code:
    | AwaitFn<RpmgDAO['findOneByCode']>
    | AwaitFn<RpmgDAO['findOneByDefault']>;
};

export class InsightRpmgBiz extends InsightBiz<InsightRpmgOpt> {
  async getOneByCode(code?: string) {
    if (code) {
      const summary = await this.services.dao.rpmg.findOneByCode(code);
      if (summary) {
        return summary;
      }
    }

    const defaultInsight = await this.services.dao.rpmg.findOneByDefault();
    if (!defaultInsight) {
      throw new this.exception.InternalServerError('missing migration');
    }

    return defaultInsight;
  }

  async uploadXls(contents: InsightRpmgOpt['Upload'], reportDate?: string) {
    throw new Error('not implemented');
  }
}
