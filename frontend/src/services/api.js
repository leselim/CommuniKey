import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Unwraps the response envelope defined in docs/12_API_DESIGN.md:
 * { "success": true, "message": "...", "data": {} }
 * Falls back to the raw body for plain DRF responses.
 */
export function unwrap(response) {
  const body = response && response.data;
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return body.data;
  }
  return body;
}

/**
 * GET a collection. Resolves to an array, or null when the endpoint is
 * unavailable (the MVP backend routes are still scaffolds).
 */
export async function fetchCollection(path) {
  try {
    const data = unwrap(await api.get(path));
    return Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
}

/**
 * POST/PUT a resource. Resolves to the saved resource, or null when the
 * request could not be completed, so callers can keep working locally.
 */
export async function save(path, payload, method = 'post') {
  try {
    return unwrap(await api[method](path, payload));
  } catch (error) {
    return null;
  }
}

export default api;
