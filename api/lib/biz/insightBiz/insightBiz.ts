import { Biz } from '../utils';

type InsightBizOpt = {
  Upload: {}; // insights upload
  Code: {} | undefined; // insights for a naics code
};

export abstract class InsightBiz<T extends InsightBizOpt> extends Biz {
  public abstract uploadXls(
    contents: T['Upload'],
    reportDate?: string
  ): Promise<void>;

  public abstract getOneByCode(code?: string): Promise<T['Code']>;

  /**
   * converting a range of numbers into a 2d array for better traversal
   *
   * e.g. given 3 ranges: <N, N-M, ..., >N
   * converts to following array:
   * [-Infinity, N], [N, M], ..., [N, Infinity]
   */
  protected strRangeToNumber<T extends {} = {}>(
    summary: ({ range: string } & T)[]
  ) {
    return summary
      .map((summary) => {
        return {
          ...summary,
          range: summary.range.split(/[><-]+/),
        } as { range: string[] } & T;
      })
      .map((summary) => {
        if (summary.range[0] === '') {
          // must be >N or <N format, remove leading
          summary.range.shift();
        }
        return summary;
      })
      .map((summary) => {
        // convert to num
        return {
          ...summary,
          range: summary.range.map((elem) => Number(elem)),
        } as { range: number[] } & T;
      })
      .reduce((acc, summary, idx, self) => {
        if (summary.range.length === 2) {
          acc.push(summary as { range: [number, number] } & T);
        } else if (summary.range.length === 1) {
          // all ranges are now [N], [N, M], ..., [N]
          // this is to determine whether our current index is infinity leading or trailing
          const isLowerBound = self.every(
            (innerSum) => innerSum.range[0] >= summary.range[0]
          );
          if (isLowerBound) {
            acc.push({
              ...summary,
              range: [-Infinity, summary.range[0]],
            });
          } else {
            acc.push({
              ...summary,
              range: [summary.range[0], Infinity],
            });
          }
        }

        return acc;
      }, [] as ({ range: [number, number] } & T)[]);
  }
}
