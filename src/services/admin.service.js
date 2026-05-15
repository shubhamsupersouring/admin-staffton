import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for administrative and dashboard management.
 */
export const adminService = {
  /**
   * Get overall dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },

  /**
   * Get information about the currently logged in admin
   */
  getCurrentAdmin: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ME);
    return response.data;
  },

  /**
   * Get list of all administrators
   */
  getAdmins: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ADMINS);
    return response.data;
  },

  /**
   * Create a new administrator
   * @param {Object} adminData 
   */
  createAdmin: async (adminData) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.ADMINS, adminData);
    return response.data;
  },

  /**
   * Update an administrator's details
   * @param {string} id 
   * @param {Object} adminData 
   */
  updateAdmin: async (id, adminData) => {
    const response = await apiClient.patch(API_ENDPOINTS.ADMIN.ADMIN_DETAIL(id), adminData);
    return response.data;
  },

  /**
   * Delete an administrator account
   * @param {string} id 
   */
  deleteAdmin: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.ADMIN_DETAIL(id));
    return response.data;
  }
};
