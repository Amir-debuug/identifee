import authHeader from './auth-header';
import axios from 'axios';

export class API {
  constructor() {
    this.headers = authHeader();
    this.headers['Content-Type'] = 'application/json';
  }

  async request(path, method = 'GET', body = '') {
    const opts = {
      method,
      headers: this.headers,
    };

    if (body !== '') {
      opts.body = JSON.stringify(body);
    }

    return fetch(path, opts);
  }

  async CreateCategory(body) {
    const url = `/api/categories`;
    const response = await this.request(url, 'POST', body);
    return Promise.resolve(response.json());
  }

  async GetUserInfo() {
    const resp = await this.request('/api/users/me');
    return Promise.resolve(resp.json());
  }

  async GetLessons({ page = 1, limit = 10, ...rest }) {
    return axios
      .get('/api/lessons', {
        headers: authHeader(),
        params: {
          page,
          limit,
          ...rest,
        },
      })
      .then((response) => response.data)
      .catch((e) => console.log(e));
  }

  async GetLessonById(id) {
    const resp = await this.request(`/api/lessons/${id}`);
    return Promise.resolve(resp.json());
  }

  async TrackLesson(id, data) {
    // TODO Move  these API to *.service
    const body = {
      page_id: data.pageId,
    };

    const resp = await this.request(`/api/lessons/${id}/progress`, 'PUT', body);

    return Promise.resolve(resp.json());
  }
}

export default new API();
