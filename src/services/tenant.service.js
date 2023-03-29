import axios from 'axios';

import authHeader from './auth-header';

const API_URL = '/api/tenants';

class TenantService {
  getTenant() {
    return axios
      .get('/api/auth/context/tenant', { headers: authHeader() })
      .then((response) => {
        return response.data;
      });
  }

  createTenant(data) {
    return axios
      .post(`${API_URL}`, data, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  updateTenant(data, tenantId) {
    return axios
      .put(`${API_URL}/${tenantId}`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  deleteTenant(tenant_id, type) {
    return axios
      .delete(`${API_URL}/${type}/integrations`, {
        params: { tenant_id },
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  getTenants(order, pagination, includeOwners, filter) {
    const { limit, page } = pagination;
    const { search } = filter;
    return axios
      .get(`${API_URL}`, {
        params: { order, limit, page, includeOwners, search },
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  getTenantBySubdomain(domain) {
    return axios
      .get(`/api/tenants/subdomains/${domain}`)
      .then((response) => {
        return response.data;
      })
      .catch((err) => console.log(err));
  }

  getSingleTenant(tenantId) {
    return axios
      .get(`${API_URL}/${tenantId}`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  getTenantsQuizConfig(tenantId) {
    return axios
      .get(`${API_URL}/${tenantId}/config`, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  updateTenantsQuizConfig(data, tenantId) {
    return axios
      .put(`${API_URL}/${tenantId}/config`, data, {
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }
}

export default new TenantService();
