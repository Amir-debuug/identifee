import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = '/api/notifications/settings';

class NotificationService extends BaseRequestService {
  getSettings() {
    return this.get(API_URL, {
      headers: authHeader(),
    });
  }

  addSettings(settings) {
    return this.post(
      API_URL,
      { settings },
      {
        headers: authHeader(),
      }
    );
  }

  getNotifications(page = 1, limit = 10) {
    const user = JSON.parse(localStorage.getItem('idftoken'));
    if (user) {
      return this.get('/api/auth/context/notifications', {
        headers: authHeader(),
        params: { page, limit },
      });
    } else {
      return '{}';
    }
  }
}

export default new NotificationService();
