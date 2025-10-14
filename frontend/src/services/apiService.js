import { appConfig } from '../config';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Makes an API request with appropriate headers and body formatting.
 * Handles JSON parsing and error throwing.
 */
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
    config.body = body instanceof FormData ? body : JSON.stringify(body);
    if (body instanceof FormData) delete config.headers['Content-Type'];
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

  // Unwrap data property or return full data
  return data.data ?? data;
}

export default { request };
