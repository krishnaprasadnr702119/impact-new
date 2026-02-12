// api.js - Centralized API utilities

/**
 * Get the base API URL from environment variables or use a default
 * @returns {string} The base API URL
 */
export function getApiBaseUrl() {
  // Always use the current browser's origin to avoid hardcoded domains
  // This ensures the app works on any IP/domain (localhost, 192.168.x.x, domain names, etc.)
  const browserOrigin = window.location.origin;

  console.log('API URL (using browser origin):', browserOrigin);
  return browserOrigin;
}

/**
 * Build a full API URL with the given endpoint
 * @param {string} endpoint - The API endpoint path (should start with '/api/')
 * @returns {string} The full API URL
 */
export function buildApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();

  // Ensure endpoint starts with /api/
  if (!endpoint.startsWith('/api/') && !endpoint.startsWith('api/')) {
    endpoint = `/api/${endpoint}`;
  }

  // Ensure endpoint starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  // return `${baseUrl}${endpoint}`;
  return `${baseUrl}${endpoint}`;
}

/**
 * Build a full URL for uploaded files
 * @param {string} path - The file path (e.g., 'uploads/courses/4/modules/5/video.mp4')
 * @param {boolean} useApi - Whether to use the API endpoint for file access
 * @returns {string} The full URL to the file
 */
export function buildFileUrl(path, useApi = false) {
  if (!path) {
    console.error('buildFileUrl called with empty path');
    return '';
  }

  // Check if we're already dealing with a full URL
  if (path.match(/^https?:\/\//)) {
    console.log('Already full URL:', path);
    return path;
  }

  const baseUrl = getApiBaseUrl();

  // Normalize the path - remove leading slashes but keep the rest
  let normalizedPath = path.replace(/^\/+/, '');

  // Ensure path starts with 'uploads/' if it doesn't already
  if (!normalizedPath.startsWith('uploads/')) {
    // If it contains 'uploads/' somewhere, extract from that point
    if (normalizedPath.includes('uploads/')) {
      const uploadsIndex = normalizedPath.indexOf('uploads/');
      normalizedPath = normalizedPath.substring(uploadsIndex);
    } else {
      // Otherwise assume it's a relative path from uploads/
      normalizedPath = `uploads/${normalizedPath}`;
    }
  }

  // Build the final URL
  // For direct access: http://localhost/uploads/courses/4/modules/5/video.mp4
  // For API access: http://localhost/api/uploads/courses/4/modules/5/video.mp4
  const urlPath = useApi ? `/api/${normalizedPath}` : `/${normalizedPath}`;
  const finalUrl = `${baseUrl}${urlPath}`;

  console.log('📁 buildFileUrl - Input:', path, '| useApi:', useApi, '| Output:', finalUrl);

  return finalUrl;
}

/**
 * Check if a file exists by making an API call
 * @param {string} path - The file path to check
 * @returns {Promise<boolean>} True if the file exists, false otherwise
 */
export async function checkFileExists(path) {
  try {
    const apiUrl = buildApiUrl(`/check_file_exists?path=${encodeURIComponent(path)}`);
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Make a GET request to the API
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} The JSON response
 */
export async function apiGet(endpoint) {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The data to send
 * @returns {Promise<any>} The JSON response
 */
export async function apiPost(endpoint, data) {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a PUT request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The data to send
 * @returns {Promise<any>} The JSON response
 */
export async function apiPut(endpoint, data) {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} The JSON response
 */
export async function apiDelete(endpoint) {
  const url = buildApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
