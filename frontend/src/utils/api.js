import axios from 'axios';

// Priority:
//   1. REACT_APP_API_URL env var (set in Vercel env vars or local .env)
//   2. Known Hugging Face Space URL (update to your own space URL)
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://velarixx-lawmind-backend.hf.space/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — HF Spaces can be slow on cold start
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
        '[LawMind] Backend unreachable — Hugging Face Space may be waking up (cold start). Wait 30 seconds and try again.'
      );
    }
    return Promise.reject(error);
  }
);

// Export base URL so App.js / BackendStatus can use it for health check
export const BACKEND_BASE = API_BASE_URL.replace('/api', '');
export default api;