import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for organization-related operations.
 */
export const organizationService = {
  /**
   * Fetch list of organizations with optional filters
   * @param {Object} params 
   */
  getOrganizations: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.LIST, { params });
    return response.data;
  },

  /**
   * Get specific organization details
   * @param {string} id 
   */
  getOrganizationDetails: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.DETAILS(id));
    return response.data;
  },

  /**
   * Get organization statistics
   */
  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.STATS);
    return response.data;
  },

  /**
   * Get list of organization verification requests
   * @param {Object} params 
   */
  getVerifications: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.VERIFICATIONS, { params });
    return response.data;
  },

  /**
   * Update the verification status of an organization
   * @param {string} id 
   * @param {Object} data - { status, reason }
   */
  updateVerificationStatus: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.VERIFICATION_DETAIL(id), data);
    return response.data;
  },

  /**
   * Suspend an organization
   * @param {string} id 
   * @param {Object} data - { reason }
   */
  suspendOrganization: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.SUSPEND(id), data);
    return response.data;
  },

  /**
   * Reactivate an organization
   * @param {string} id 
   * @param {Object} data - { reason }
   */
  reactivateOrganization: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.REACTIVATE(id), data);
    return response.data;
  },

  /**
   * Send an invitation to a new organization
   * @param {Object} data - { org_name, contact_name, contact_email }
   */
  inviteOrganization: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.INVITATIONS, data);
    return response.data;
  },

  /**
   * Get list of sent invitations
   * @param {Object} params 
   */
  getInvitations: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.INVITATIONS, { params });
    return response.data;
  },

  /**
   * Update an invitation (resend, extend, revoke)
   * @param {string} id 
   * @param {Object} data - { action }
   */
  updateInvitation: async (id, data) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.INVITATION_DETAIL(id), data);
    return response.data;
  }
};
