import { ReportType } from 'lib/middlewares/sequelize';
import {
  ReportGeneratorBiz,
  ReportGeneratorBizConfig,
} from './ReportGeneratorBiz';
import { Treasury } from './Treasury';

const { REPORTS_DIR = '/tmp' } = process.env;

const configToReport: {
  [K in ReportType]: {
    new (config: any, tmpLocation: string): ReportGeneratorBiz<
      ReportGeneratorBizConfig<K>
    >;
  };
} = {
  TREASURY: Treasury,
};

export function reportGeneratorBizFactory<T extends ReportGeneratorBizConfig>(
  config: T
) {
  const ReportClass = configToReport[config.input.type];

  return new ReportClass({ input: config.input }, REPORTS_DIR);
}

// Transforms `month` to a valid ISO date string.
// TODO remove the use of this function by migrating `month` to ISO string field
export function parseReportDate(month: string) {
  let date = month;
  if (month.length === 'YYYYMM'.length && !month.includes('-')) {
    // day 5 is appended as YYYY-MM format may lead to incorrect date due to timestamp shift...
    date = `${month.substring(0, 4)}-${month.substr(4)}-05`;
    date = new Date(date).toISOString();
  }
  return date;
}
