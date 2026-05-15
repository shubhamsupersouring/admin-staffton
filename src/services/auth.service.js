import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

/**
 * Service for handling authentication and invitation related API calls.
 */
export const authService = {
  /**
   * Request an OTP for candidate login
   * @param {string} email 
   */
  requestLoginOtp: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CANDIDATE_LOGIN_OTP, { email });
    return response.data;
  },

  /**
   * Request an OTP for candidate registration
   * @param {Object} userData 
   */
  requestRegisterOtp: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CANDIDATE_REGISTER_OTP, userData);
    return response.data;
  },

  /**
   * Verify the OTP sent to email
   * @param {string} email 
   * @param {string} otp 
   */
  verifyOtp: async (email, otp) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return response.data;
  },

  /**
   * Admin login with email and password
   * @param {Object} credentials 
   */
  adminLogin: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);
    return response.data;
  },

  /**
   * Verify an invitation token
   * @param {string} token 
   */
  verifyInvitation: async (token) => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_INVITATION(token));
    return response.data;
  },

  /**
   * Accept an invitation and set up password
   * @param {string} token 
   * @param {string} password 
   */
  acceptInvitation: async (token, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.ACCEPT_INVITATION, { token, password });
    return response.data;
  }
};
