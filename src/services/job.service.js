import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for job-related management operations.
 */
export const jobService = {
  /**
   * Fetch a list of all jobs with optional filters
   * @param {Object} params 
   */
  getJobs: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.LIST, { params });
    return response.data;
  },

  /**
   * Get detailed information for a specific job
   * @param {string} id 
   */
  getJobDetails: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.DETAILS(id));
    return response.data;
  },

  /**
   * Get statistics for all jobs
   */
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.STATS);
    return response.data;
  },

  /**
   * Get candidate pipeline for a specific job
   * @param {Object} params - { jobId, status }
   */
  getPipeline: async (jobId, params) => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.PIPELINE(jobId), { params });
    return response.data;
  },

  /**
   * Get stats for a job's candidate pipeline stages
   * @param {string} id - Job ID
   */
  getPipelineStats: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.PIPELINE_STATS(id));
    return response.data;
  },

  /**
   * Get chat messages/details for a specific job application
   * @param {string} applicationId - Job Application ID
   */
  getApplicationChat: async (applicationId) => {
    const response = await apiClient.get(API_ENDPOINTS.JOBS.APPLICATION_CHAT(applicationId));
    return response.data;
  }
};
