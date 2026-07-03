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
   * Get statistics for all candidates
   */
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.STATS);
    return response.data;
  },

  /**
   * Get detailed information for a specific candidate
   * @param {string} id 
   */
  getCandidateDetails: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.CANDIDATE_DETAIL(id));
    return response.data;
  },

  /**
   * Delete a specific candidate
   * @param {string} id
   */
  deleteCandidate: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.CANDIDATES.DETAILS(id));
    return response.data;
  },

  /**
   * Update active status of a candidate
   * @param {string} id
   * @param {boolean} isActive
   */
  updateStatus: async (id, isActive) => {
    const response = await apiClient.put(API_ENDPOINTS.CANDIDATES.STATUS(id), { is_active: isActive });
    return response.data;
  }
};
