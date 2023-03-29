import axios from 'axios';
import { Article } from './Article';

const RESULTS_LIMIT = 100;

export class BingNewsAPI {
  _url = 'https://api.bing.microsoft.com/v7.0/news';
  _apiKey = process.env.BINGNEWS_API_KEY;

  constructor() {
    // super('bing');
  }

  async request(path: string, query?: any): Promise<any> {
    return await axios.get(`${this._url}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this._apiKey}`,
      },
      params: query,
    });
  }

  serializeArticle(a: any): Article {
    const article = {
      title: a.name,
      blurb: a.description,
      body: a.content,
      author: '',
      published: a.datePublished,
      image: a.image ? a.image.thumbnail.contentUrl : '',
      source: '',
      source_icon: '',
      url: a.url,
    };

    if (a.provider && a.provider.length) {
      if (a.provider[0].name != '') {
        article.source = a.provider[0].name;
      }
      if (a.provider[0].image) {
        article.source_icon = a.provider[0].image.thumbnail.contentUrl;
      }
    }

    return article;
  }

  async getTopHeadlines(opts: any): Promise<any> {
    const results: any = {
      total: 0,
      articles: [],
    };

    let path = '';
    let resp = null;
    const limit = 12;

    // https://learn.microsoft.com/en-us/bing/search-apis/bing-news-search/reference/query-parameters
    const query: any = {
      cc: opts.country || 'us',
      category: opts.category || '',
      count: limit,
      offset: opts.page * limit,
      q: opts.q || '',
      setLang: 'en',
    };

    if (query.q != '') {
      path = '/search';
      query.freshness = 'Week';
    }

    try {
      resp = await this.request(`${path}`, query);
    } catch (err) {
      return results;
    }

    if (resp.status && resp.status != 200) {
      return results;
    }

    const articles: Article[] = [];
    resp.data.value.map((a: any) => {
      articles.push(this.serializeArticle(a));
    });

    // truncating results
    // `totalEstimatedMatches` is only returned when performing a search
    if (
      resp.data.totalEstimatedMatches &&
      resp.data.totalEstimatedMatches > RESULTS_LIMIT
    ) {
      results.total = RESULTS_LIMIT;
    } else {
      results.total = resp.data.value.length;
    }

    results.articles = articles;

    return results;
  }
}
