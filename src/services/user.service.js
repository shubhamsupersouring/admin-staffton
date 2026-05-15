import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for hospital user management.
 */
export const userService = {
  /**
   * Fetch a list of hospital users with optional filters
   * @param {Object} params 
   */
  getUsers: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },

  /**
   * Get overall user statistics
   */
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.STATS);
    return response.data;
  },

  /**
   * Get list of organizations available for user assignment
   */
  getOrganizations: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ORGANIZATIONS);
    return response.data;
  },

  /**
   * Toggle a user's active/inactive status
   * @param {string} id 
   */
  toggleStatus: async (id) => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.TOGGLE_STATUS(id));
    return response.data;
  }
};
