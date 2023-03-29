import { NewsAPIOrg } from './newsorg';
import { NewsDataAPI } from './newsdata';
import { BingNewsAPI } from './bingnews';

export type NewsService = 'newsapi' | 'newsdata' | 'bingnews';

export function newsFactory(type: NewsService = 'newsapi') {
  if (type === 'newsapi') {
    return new NewsAPIOrg();
  } else if (type === 'newsdata') {
    return new NewsDataAPI();
  } else if (type === 'bingnews') {
    return new BingNewsAPI();
  }
  throw new Error('unknown news api service');
}
