import axios from 'axios';

const apiClient = axios.create({
  baseURL: "https://dev-api.stafftonhealth.com/api/v1",
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('auth_user');
      
      // We use window.location directly here to avoid circular dependencies with the Redux store
      // This will force a page reload and clear the Redux state
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
