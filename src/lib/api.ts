import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base API URL for FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (e.g., adding Auth token if needed later)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const token = localStorage.getItem('token');
    // if (token && config.headers) {
    //   config.headers.Authorization = \`Bearer ${token}\`;
    // }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    // Here we can handle global errors, like 401 Unauthorized
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
