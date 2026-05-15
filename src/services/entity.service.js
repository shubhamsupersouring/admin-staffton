import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for managing platform entities (Roles, Specializations, etc.)
 */
export const entityService = {
  /**
   * Fetch all entities of a certain type
   * @param {Object} params - { type, q }
   */
  getAll: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ENTITIES.ALL, { params });
    return response.data;
  },

  /**
   * Create a new entity
   * @param {Object} data 
   */
  create: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.ENTITIES.BASE, data);
    return response.data;
  },

  /**
   * Update an existing entity
   * @param {string} id 
   * @param {Object} data 
   */
  update: async (id, data) => {
    const response = await apiClient.put(API_ENDPOINTS.ENTITIES.DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete an entity
   * @param {string} id 
   */
  delete: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.ENTITIES.DETAIL(id));
    return response.data;
  }
};
