import cubejs from '@cubejs-client/core';
import axios from 'axios';
import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

class CubeService extends BaseRequestService {
  constructor() {
    super();
    this.initCube();
  }

  initCube(type = 'POST') {
    this.cube = cubejs(
      () => {
        const creds = JSON.parse(localStorage.getItem('idftoken'));
        return `Bearer ${creds.access_token}`;
      },
      {
        apiUrl: `${window.location.origin}/api/analytics/v1`,
        method: type,
      }
    );
  }

  getCube(type) {
    this.initCube(type);
    return this.cube;
  }

  getAnalytics({ isPublic }) {
    return axios
      .get('/api/analytics', {
        params: { isPublic },
        headers: authHeader(),
      })
      .then((response) => response.data);
  }

  getMeta() {
    return axios.get('/api/analytics/v1/meta', {
      headers: authHeader(),
    });
  }
}

export const cubeService = new CubeService();
