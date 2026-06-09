import axios from 'axios';

import { clearToken, getToken } from '../auth/token.js';

// API 베이스 URL은 env로(하드코딩 금지). dev는 Vite 프록시(/api → :8080) 기본값 사용.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({ baseURL: API_BASE_URL });

// 요청마다 Bearer 자동 첨부.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401(만료/무효) → 토큰 정리 후 로그인으로. 단, 로그인/가입 요청의 401은
// 화면에서 인라인 처리해야 하므로 전역 리다이렉트에서 제외.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/signup');
    if (status === 401 && !isAuthCall) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default client;
