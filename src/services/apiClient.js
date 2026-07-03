import axios from 'axios';

const isPlainObject = (val) => {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
};

const lowercaseEmailFields = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(lowercaseEmailFields);
  }
  if (isPlainObject(obj)) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'string' && key.toLowerCase().includes('email')) {
          result[key] = value.toLowerCase().trim();
        } else if (typeof value === 'object') {
          result[key] = lowercaseEmailFields(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
  return obj;
};

//const baseURL =import.meta.env.VITE_ENVIORMENT_VARIABLE == 'production' ? import.meta.env.VITE_API_BASE_URL_PRODUCTION  : import.meta.env.VITE_API_BASE_URL_DEVELOPMENT
 const baseURL = 'https://dev-api.stafftonhealth.com/api/v1'
// const baseURL = 'https://api.stafftonhealth.com/api/v1'
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data) {
    config.data = lowercaseEmailFields(config.data);
  }
  if (config.params) {
    config.params = lowercaseEmailFields(config.params);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = lowercaseEmailFields(response.data);
    }
    return response;
  },
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
