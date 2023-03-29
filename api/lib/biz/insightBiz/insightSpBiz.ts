import { SpDAO } from 'lib/dao';
import { SpSummaryCreateDAO } from 'lib/middlewares/sequelize';
import { AwaitFn } from 'lib/utils';
import { InsightBiz } from './insightBiz';

type InsightSpOpt = {
  Upload: {
    type: 'sp';
    excel: {
      name: 'naics'; // e.g. 11, 11-33
      data: [
        [],
        [],
        // generally formatted as: DSO [2][1], DPO [2][2], WC [2][3], WCR [2][4]
        number[],
        (
          | 'DAYS_SALES_OUT'
          | 'DAYS_PAYABLE_OUT'
          | 'WORKING_CAP'
          | 'WORKING_CAP_RATIO'
        )[]
      ];
    }[];
  };
  Code:
    | AwaitFn<SpDAO['findOneByCode']>
    | AwaitFn<SpDAO['findAllByAggregationType']>;
};

export class InsightSpBiz extends InsightBiz<InsightSpOpt> {
  async getOneByCode(code?: string) {
    if (code) {
      const summary = await this.services.dao.sp.findOneByCode(code);
      if (summary) {
        return summary;
      }
    }

    const aggregation = await this.services.dao.sp.findOneByAggregationType(
      'AVERAGE'
    );
    if (!aggregation) {
      throw new this.exception.InternalServerError('missing migration');
    }

    return aggregation;
  }

  async uploadXls(contents: InsightSpOpt['Upload'], reportDate?: string) {
    const uploadDate = reportDate ? new Date(reportDate) : new Date();
    const naicsSummary = contents.excel.reduce(
      (acc, data) => {
        // malformed names may contain spaces
        const name = data.name.split(' ')[0];
        // only want codes in digit format `123` or `42-43`
        if (!name.match(/^\d+$|^\d+-\d+$/g)) {
          return acc;
        }
        const columnNames = data.data[3];
        const dsoIndex = columnNames.indexOf('DAYS_SALES_OUT');
        const dpoIndex = columnNames.indexOf('DAYS_PAYABLE_OUT');
        const wcIndex = columnNames.indexOf('WORKING_CAP');
        const wcrIndex = columnNames.indexOf('WORKING_CAP_RATIO');

        acc.push({
          codes: [name],
          report_date: uploadDate,
          // see SPInsightUpload type for index
          // generally follows the type but sometimes sheet is malformed...
          days_sales_out: Math.round(data.data[2][dsoIndex]),
          days_payable_out: Math.round(data.data[2][dpoIndex]),
          working_capital: Math.round(data.data[2][wcIndex]),
          working_capital_ratio: Math.round(data.data[2][wcrIndex]),
        });

        return acc;
      },
      [] as ({
        codes: string[];
      } & SpSummaryCreateDAO)[]
    );

    naicsSummary.forEach((summary) => {
      // range, needs to be split
      if (summary.codes[0].includes('-')) {
        const naicsRange = this.strRangeToNumber([{ range: summary.codes[0] }]);
        const completeRange = [];
        for (let i = naicsRange[0].range[0]; i <= naicsRange[0].range[1]; i++) {
          completeRange.push(i);
        }
        const naicsStr = completeRange.map((range) => range.toString());
        summary.codes = naicsStr;
      }
    });

    const average = naicsSummary.reduce(
      (acc, summary) => {
        acc.days_payable_out += summary.days_payable_out || 0;
        acc.days_sales_out += summary.days_sales_out || 0;
        acc.working_capital += summary.working_capital || 0;
        acc.working_capital_ratio += summary.working_capital_ratio || 0;

        return acc;
      },
      {
        report_date: uploadDate,
        days_sales_out: 0,
        days_payable_out: 0,
        working_capital: 0,
        working_capital_ratio: 0,
        aggregation_type: 'AVERAGE' as const,
      }
    );
    const getAverage = (sum: number, length: number) =>
      Math.round(sum / length);

    average.days_payable_out = getAverage(
      average.days_payable_out,
      naicsSummary.length
    );
    average.days_sales_out = getAverage(
      average.days_sales_out,
      naicsSummary.length
    );
    average.working_capital = getAverage(
      average.working_capital,
      naicsSummary.length
    );
    average.working_capital_ratio = getAverage(
      average.working_capital_ratio,
      naicsSummary.length
    );

    await this.services.dao.sp.bulkUpsertAggregations([average]);
    await this.services.dao.sp.bulkUpsertWithCodes(naicsSummary);
  }
}
