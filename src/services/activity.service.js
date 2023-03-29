import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';
import axios from 'axios';
const API_URL = '/api/activities';

class ActivityContactService extends BaseRequestService {
  getActivity(queryFilter, { type, page, limit }) {
    const { filter, organizationId, contactId, dealId, ...restProps } =
      queryFilter || {};

    const params = {
      ...restProps,
      ...filter,
      organizationId,
      contactId,
      dealId,
      type,
      page,
      limit,
    };
    return axios
      .get(API_URL, {
        params,
        headers: authHeader(),
      })
      .then((response) => {
        return response.data;
      });
  }

  createActivityRequest(data) {
    return this.post(`${API_URL}/requests`, data, {
      headers: authHeader(),
    });
  }

  deleteActivity(activityId) {
    return this.delete(`${API_URL}/${activityId}`, { headers: authHeader() })
      .then((response) => {
        return response.data;
      })
      .catch((error) => error);
  }

  markAsCompleted(activityId) {
    return axios.put(
      `${API_URL}/${activityId}/complete`,
      {},
      { headers: authHeader() }
    );
  }

  cancelActivity(activityId) {
    return axios.put(
      `${API_URL}/${activityId}/cancel`,
      {},
      { headers: authHeader() }
    );
  }

  getSingleActivity(activityId) {
    return axios.get(
      `${API_URL}/${activityId}`,
      {
        headers: authHeader(),
      },
      {}
    );
  }
}

export default new ActivityContactService();
