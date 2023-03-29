import axios from 'axios';
import authHeader from './auth-header';
import { PROSPECTS_FILTER_STORAGE_KEY } from '../utils/Utils';

const API_URL = '/api/auth/';
const STORAGE_KEY = 'idftoken';

class AuthService {
  async login(client_id, email, password, code = null) {
    const response = await axios.post(API_URL + 'login', {
      grant_type: 'password',
      client_id,
      username: email,
      password,
      otp: code || undefined,
    });
    if (response?.response?.status === 401) throw response;

    if (
      response.data.access_token &&
      response.data.access_token !== 'otp_enabled'
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
    }

    return response.data;
  }

  async impersonate(id, updateStorage) {
    const response = await axios.post(
      `/api/users/${id}/impersonation`,
      { id },
      {
        headers: authHeader(),
      }
    );
    if (
      updateStorage &&
      response.data.access_token &&
      response.data.access_token !== 'otp_enabled'
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('user_permissions');
      localStorage.removeItem(PROSPECTS_FILTER_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
    }

    return response.data;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROSPECTS_FILTER_STORAGE_KEY);
    localStorage.removeItem('user_permissions');
  }

  async requestPassword(email) {
    const response = await axios.post(API_URL + 'password/request', {
      email,
    });
    return response.data.message;
  }

  async resetPassword(password, token) {
    const { data } = await axios.post(
      API_URL + 'password/reset',
      {
        password,
      },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    );
    return data;
  }

  isTokenValid() {
    const token = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const now = new Date().getTime();

    if (token && token.expires - now > 0) {
      return true;
    }

    // token expired remove it from localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROSPECTS_FILTER_STORAGE_KEY);
    return false;
  }

  guestToken(email) {
    return axios.post(`/api/auth/guest/token`, {
      grant_type: 'guest_generate',
      username: email,
      redirect_url: `${process.env.REACT_APP_CLIENT_PORTAL_URL}/clientportal/dashboard`,
    });
  }

  async introspect(token) {
    const { data } = await axios.post(
      '/api/auth/token/introspect',
      { token },
      {
        headers: {
          // TODO may need to fix token storage naming
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  }
}

export default new AuthService();
