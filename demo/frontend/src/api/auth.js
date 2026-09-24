import { api, setAuthToken } from './client';

export async function register(username, email, password) {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
}

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

export async function fetchCurrentUser(token) {
  setAuthToken(token);
  const { data } = await api.post('/auth/me', null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

function extractErrorMessage(error) {
  const data = error.response?.data;
  if (typeof data === 'string' && data) {
    return data;
  }
  if (data?.errors?.length) {
    return data.errors.map((e) => e.defaultMessage || e.message).join('\n');
  }
  if (data?.message) {
    return data.message;
  }
  if (error.request && !error.response) {
    return 'Could not reach the server. Check your network connection and backend URL.';
  }
  return error.message || 'Something went wrong';
}

export { extractErrorMessage };
