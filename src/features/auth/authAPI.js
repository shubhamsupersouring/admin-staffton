import apiClient from '../../services/apiClient';
import { API_ENDPOINTS } from '../../services/endpoints';

export const requestLoginOtp = async (email) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.CANDIDATE_LOGIN_OTP, { email });
  return response.data;
};

export const requestRegisterOtp = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.CANDIDATE_REGISTER_OTP, userData);
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);
  return response.data;
};
