import axios from 'axios';

// Set in Vercel Dashboard → Settings → Environment Variables
// REACT_APP_API_URL = https://your-replit.repl.co/api
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — Replit can be slow on cold start
});

// Attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lawmind_token');
    if (token && token !== 'disabled') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.warn(
        '[LawMind] Backend unreachable — Replit may be waking up. Wait 15 seconds and try again.'
      );
    }
    return Promise.reject(error);
  }
);

// Export base URL so App.js can use it for health check
export const BACKEND_BASE = API_BASE_URL.replace('/api', '');
export default api;