export const API_ENDPOINTS = {
  AUTH: {
    CANDIDATE_LOGIN_OTP: '/auth/candidate/login/send-otp',
    CANDIDATE_REGISTER_OTP: '/auth/candidate/register/send-otp',
    VERIFY_OTP: '/auth/candidate/verify-otp',
    ME: '/auth/me',
    ADMIN_LOGIN: '/auth/admin/login',
  },
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard-stats',
    INVITATIONS: '/admin/invitations',
    VERIFICATIONS: '/admin/verifications',
  },
  CANDIDATES: {
    LIST: '/candidates',
    DETAILS: (id) => `/candidates/${id}`,
  },
};
