import axios from 'axios';

import authHeader from './auth-header';

const API_URL = '/api/news';

class NewsService {
  /**
   * Get read later list of articles
   * @param {*} opts {page, limit}
   * @returns List of articles to read later
   */
  async getArticles(params) {
    return axios
      .get(`${API_URL}/articles`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  /**
   * Adds article to read later
   * @param {*} body {title, image, etc}
   * @returns
   */
  async addArticle(body) {
    // set null attributes to empty string
    Object.keys(body).map((key) => {
      if (!body[key]) {
        body[key] = '';
      }
      return key;
    });

    return axios
      .post(`${API_URL}/articles`, body, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  /**
   * Removes article from read later list
   * @param {*} id article_id
   * @returns
   */
  async delArticle(id) {
    return axios
      .delete(`${API_URL}/articles/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }

  async getNews(opts) {
    const params = opts;

    return axios
      .get(`${API_URL}`, {
        params,
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((e) => console.log(e));
  }
}

export default new NewsService();
