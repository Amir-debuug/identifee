import { BizOpts } from '../utils';
import { InsightRpmgBiz } from './insightRpmgBiz';
import { InsightSpBiz } from './insightSpBiz';

type InsightBizType = 'sp' | 'rpmg';

export type InsightBizFactory<T extends InsightBizType> = T extends 'sp'
  ? InsightSpBiz
  : T extends 'rpmg'
  ? InsightRpmgBiz
  : never;

export function insightBizFactory<T extends InsightBizType>(
  type: T,
  opts: BizOpts
) {
  if (type === 'rpmg') {
    return new InsightRpmgBiz(opts) as InsightBizFactory<T>;
  } else if (type === 'sp') {
    return new InsightSpBiz(opts) as InsightBizFactory<T>;
  }

  throw new Error('unknown insight type');
}
