import authHeader from './auth-header';
import BaseRequestService from './baseRequest.service';

const API_URL = '/api/pipelines';

class PipelineService extends BaseRequestService {
  async getPipelines(page = 1, limit = 20) {
    const response = await this.get(
      API_URL,
      {
        headers: authHeader(),
        params: { page, limit },
      },
      { fullResponse: true }
    );

    return response?.data;
  }

  getPipeline(pipelineId) {
    return this.get(`${API_URL}/${pipelineId}`, {
      headers: authHeader(),
    });
  }

  getPipelineTeam(pipelineId) {
    return this.get(`${API_URL}/${pipelineId}/teams`, {
      headers: authHeader(),
    });
  }

  getPipelineDealsCount(pipelineId) {
    return this.get(`${API_URL}/${pipelineId}/deals`, {
      headers: authHeader(),
    });
  }

  setPipelineTeam(teamIds) {
    return this.post('/api/pipelineTeams', teamIds, {
      headers: authHeader(),
    });
  }

  deletePipelineTeam(pipelineId, teamId) {
    return this.delete(`${API_URL}/${pipelineId}/team/${teamId}`, {
      headers: authHeader(),
    });
  }

  createPipeline(data) {
    return this.post(API_URL, data, {
      headers: authHeader(),
    });
  }

  updatePipeline(pipelineId, data) {
    return this.put(`${API_URL}/${pipelineId}`, data, {
      headers: authHeader(),
    });
  }

  clonePipeline(pipelineId, data) {
    return this.post(`${API_URL}/${pipelineId}`, data, {
      headers: authHeader(),
    });
  }

  deletePipeline(pipelineId, transferId) {
    return this.delete(`${API_URL}/${pipelineId}`, {
      headers: authHeader(),
      params: { transferId },
    });
  }

  setDefaultPipeline(pipelineId) {
    return this.put(
      `${API_URL}/${pipelineId}/default`,
      {},
      {
        headers: authHeader(),
      }
    );
  }
}

export default new PipelineService();
