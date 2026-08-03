import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for hospital access / join request operations.
 */
export const hospitalJoinRequestService = {
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.HOSPITAL_JOIN_REQUESTS.STATS);
    return response.data;
  },

  getRequests: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.HOSPITAL_JOIN_REQUESTS.LIST, { params });
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.HOSPITAL_JOIN_REQUESTS.DETAIL(id), data);
    return response.data;
  },
};
