const DEFAULT_DEV_API_URL = 'http://localhost:5000/api/v1';
const configuredApiUrl = import.meta.env.VITE_API_URL;
const BASE_URL = configuredApiUrl || (import.meta.env.DEV ? DEFAULT_DEV_API_URL : '');

let getSessionToken = () => null;

export function setTokenGetter(fn) {
  getSessionToken = fn;
}

async function apiFetch(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('Backend API is not configured. Set VITE_API_URL to your backend base URL.');
  }

  const token = await getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path)        => apiFetch(path, { method: 'GET' }),
  post:   (path, body)  => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    (path, body)  => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  (path, body)  => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)        => apiFetch(path, { method: 'DELETE' }),
};
