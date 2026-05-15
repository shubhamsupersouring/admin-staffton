import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for candidate management.
 */
export const candidateService = {
  /**
   * Fetch a list of candidates with optional filters
   * @param {Object} params 
   */
  getCandidates: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.LIST, { params });
    return response.data;
  },

  /**
   * Get candidate-specific statistics
   */
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.STATS);
    return response.data;
  }
};
