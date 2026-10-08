import { authStorage } from './auth';

/**
 * Custom Error class for API failures.
 */
export class ApiError extends Error {
  constructor(message, status = 500, errors = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

/**
 * Normalize base API URL from environment configuration.
 * Defaults to http://localhost:5000/api
 */
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // If user provided http://localhost:5000 without /api, append /api
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

/**
 * Base request handler supporting all HTTP methods, headers, and token injection.
 */
async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = authStorage.getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      'Unable to connect to the server. Please ensure the backend is running.',
      0,
      null
    );
  }

  // Parse JSON response safely
  let responseData = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      (response.status === 401
        ? 'Authentication required or session expired.'
        : response.status === 403
        ? 'You do not have permission to perform this action.'
        : response.status === 404
        ? 'The requested resource was not found.'
        : response.status === 409
        ? 'A conflict occurred with your request.'
        : `Request failed with status ${response.status}`);

    const errorDetails = responseData?.errors || null;

    // Dispatch global unauthorized event for 401s so AuthContext can react
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sbp:unauthorized'));
    }

    throw new ApiError(errorMessage, response.status, errorDetails, responseData);
  }

  return responseData;
}

/**
 * REST API client instance.
 */
export const apiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PATCH', body });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};
