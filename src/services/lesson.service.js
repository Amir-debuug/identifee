import axios from 'axios';

import authHeader from './auth-header';

const API_URL = '/api/lessons';
const STORAGE_KEY = 'idftoken';

class LessonService {
  GetLessonsByCatId(catId, search = '', page = 1, limit = 10) {
    const params = {
      page,
      limit,
    };

    if (search?.trim() !== '') {
      params.search = search;
    }

    return axios
      .get(`/api/categories/${catId}/lessons`, {
        params,
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  async getRelatedLessons() {
    const result = await axios.get(`${API_URL}/related`, {
      headers: authHeader(),
    });
    return result.data;
  }

  GetLessonTrackByLessonId(id, params = {}) {
    const { access_token } = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return axios
      .get(API_URL + `/${id}/progress`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        params,
      })
      .then((response) => response.data);
  }

  PutFavoriteByLessonId({ id }) {
    const { access_token } = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return axios
      .put(
        API_URL + `/${id}/favorite`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response.data);
  }

  SubmitAnswer(lessonId, pageId, answer) {
    return axios
      .post(
        API_URL + `/${lessonId}/pages/${pageId}/check`,
        { answer },
        { headers: authHeader() }
      )
      .then((response) => response.data);
  }

  PdfLinkByLesson(fileId) {
    return axios
      .get(`/api/assets/${fileId}`, {
        params: {
          from: 'lesson',
        },
        headers: authHeader(),
        responseType: 'blob',
      })
      .then((response) => response.data);
  }

  // seriously? this is wack, original API was doing an upsert..
  async createUpdateLesson(data) {
    const { access_token } = JSON.parse(localStorage.getItem(STORAGE_KEY));

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };

    try {
      if (data.id) {
        const { id, ...rest } = data;
        const response = await axios.put(`/api/lessons/${data.id}`, rest, {
          headers,
        });
        return response;
      } else {
        const response = await axios.post(`/api/lessons`, data, {
          headers,
        });
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  }

  upsertPages(id, pages) {
    const { access_token } = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return axios
      .put(
        `/api/lessons/${id}/pages`,
        {
          pages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response);
  }

  deleteLesson(id) {
    return axios
      .delete(`${API_URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  createVideoURL(externalUrl) {
    return axios
      .post(
        '/api/videos',
        { externalUrl },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response);
  }

  getVideo(uploadId) {
    return axios
      .get(`/api/providers/mux/${uploadId}`, {
        headers: authHeader(),
      })
      .then((response) => response);
  }

  reset(id) {
    const { access_token } = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return axios
      .put(
        `${API_URL}/${id}/progress`,
        {
          page_id: null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => response.data);
  }
}

export default new LessonService();
