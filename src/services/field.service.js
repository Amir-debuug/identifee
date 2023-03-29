import axios from 'axios';

import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL_ORGANIZATION = '/api/organizations/fields';
const API_URL = '/api/fields';
const API_URL_CONTACT = '/api/contacts/fields';

class FieldService extends BaseRequestService {
  getOptions() {
    return axios
      .get(`${API_URL}/options`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((err) => {
        console.log(err);
      });
  }

  getFieldsByType(type, { page = 1, limit = 10 }) {
    const URL =
      type === 'organization' ? API_URL_ORGANIZATION : API_URL_CONTACT;

    return axios
      .get(URL, {
        params: { page, limit },
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((err) => {
        console.log(err);
      });
  }

  getFieldById(type, fieldId) {
    const URL =
      type === 'organization' ? API_URL_ORGANIZATION : API_URL_CONTACT;

    return axios
      .get(`${URL}/${fieldId}`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((err) => {
        console.log(err);
      });
  }

  upsetFieldByType(data, type) {
    const URL =
      type === 'organization' ? API_URL_ORGANIZATION : API_URL_CONTACT;

    return axios
      .put(
        URL,
        {
          ...data,
        },
        {
          headers: authHeader(),
        }
      )
      .then((response) => response);
  }

  removeFieldByType(id, type) {
    const URL =
      type === 'organization' ? API_URL_ORGANIZATION : API_URL_CONTACT;

    return axios
      .delete(`${URL}/${id}`, {
        headers: authHeader(),
      })
      .then((response) => response)
      .catch((err) => {
        console.log(err);
      });
  }

  getFields(type, usedOrPreferred, page = 1, limit = 50) {
    return this.get(API_URL, {
      params: {
        type,
        page,
        limit,
        order: ['order', 'asc'],
        ...usedOrPreferred,
      },
      headers: authHeader(),
    });
  }

  createField(data) {
    return this.post(API_URL, data, {
      headers: authHeader(),
    });
  }

  updateField(fieldId, data) {
    return this.put(`${API_URL}/${fieldId}`, data, {
      headers: authHeader(),
    });
  }

  createDefaultFields(type) {
    return this.post(
      `${API_URL}/default`,
      { type },
      {
        headers: authHeader(),
      }
    );
  }

  deleteField(fieldId) {
    return this.delete(`${API_URL}/${fieldId}`, {
      headers: authHeader(),
    });
  }

  createQuickPrefFields(type, fieldIds) {
    return this.post(
      `${API_URL}/preference`,
      { type, fieldIds },
      {
        headers: authHeader(),
      }
    );
  }
}

export default new FieldService();
