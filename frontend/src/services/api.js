import axios from 'axios';

import { API_URL, TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';

const TOKEN_EXPIRES_KEY = 'washgo_access_token_expires';
const customerSession = createAuthSessionStorage(TOKEN_KEY, TOKEN_EXPIRES_KEY, TOKEN_KEY);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = customerSession.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      customerSession.clear();
      window.dispatchEvent(new CustomEvent('washgo:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  const d = error.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((x) => x.msg || JSON.stringify(x)).join('; ');
  }
  return error.message || 'Request failed';
}
