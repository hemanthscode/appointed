import { appConfig } from '../config';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function request(endpoint, { method = 'GET', body, headers = {}, ...customConfig } = {}) {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...customConfig,
  };

  if (body && method.toUpperCase() !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/api${endpoint}`, config);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!response.ok) {
    const error = data.message || data.error || 'API request failed';
    const errObj = new Error(error);
    if (data.errors) errObj.errors = data.errors;
    throw errObj;
  }

  return data.data ?? data;
}

export default { request };
