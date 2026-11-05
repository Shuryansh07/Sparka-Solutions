import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Normalizes every failure to { message, details, status } so UI code has one shape to handle.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message =
      body?.error ||
      (status === 0
        ? 'We could not reach Sparka right now. Check your connection and try again.'
        : 'Something went wrong. Please try again.');
    return Promise.reject({ message, details: body?.details || {}, status });
  }
);
