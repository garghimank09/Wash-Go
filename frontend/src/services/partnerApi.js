import axios from 'axios';

import { API_URL, PARTNER_TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';

const PARTNER_TOKEN_EXPIRES_KEY = 'washgo_partner_token_expires';
const partnerSession = createAuthSessionStorage(PARTNER_TOKEN_KEY, PARTNER_TOKEN_EXPIRES_KEY);

/** Axios client for partner routes — uses {@link PARTNER_TOKEN_KEY} only (never customer token). */
export const partnerApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

partnerApi.interceptors.request.use((config) => {
  const token = partnerSession.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

partnerApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      partnerSession.clear();
      window.dispatchEvent(new CustomEvent('washgo:partner-unauthorized'));
    }
    return Promise.reject(error);
  },
);
