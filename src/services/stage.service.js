import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = '/api/stages';

class StageService extends BaseRequestService {
  async getStages(pipelineId) {
    const params = { pipelineId };

    const response = await this.get(
      API_URL,
      {
        params,
        headers: authHeader(),
      },
      { fullResponse: true }
    );
    return response?.data;
  }

  async createStage(data) {
    const response = await this.post(
      API_URL,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
    return response?.data;
  }

  async updateStages(data) {
    return await this.patch(
      `${API_URL}/bulk/update`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async updateStage(id, data) {
    return await this.patch(
      `${API_URL}/${id}`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async sortStage(id, data) {
    return await this.patch(
      `${API_URL}/sort/${id}`,
      data,
      { headers: authHeader() },
      { fullResponse: true }
    );
  }

  async deleteStage(id, transferId) {
    return await this.delete(
      `${API_URL}/${id}`,
      {
        params: { transferId },
        headers: authHeader(),
      },
      { fullResponse: true }
    );
  }
}

export default new StageService();
