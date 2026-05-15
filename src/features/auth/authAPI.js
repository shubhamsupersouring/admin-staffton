import { authService } from '../../services/auth.service';

export const requestLoginOtp = async (email) => {
  return await authService.requestLoginOtp(email);
};

export const requestRegisterOtp = async (userData) => {
  return await authService.requestRegisterOtp(userData);
};

export const verifyOtp = async (email, otp) => {
  return await authService.verifyOtp(email, otp);
};

export const adminLogin = async (credentials) => {
  return await authService.adminLogin(credentials);
};
