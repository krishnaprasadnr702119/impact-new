
import { JWT_KEY } from "./constant";

const REFRESH_TOKEN_KEY = 'refresh_token';

export function setToken(token) {
  localStorage.setItem(JWT_KEY, token);
}

export function getToken() {
  return localStorage.getItem(JWT_KEY);
}

export function setRefreshToken(refreshToken) {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    
    // Convert exp to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
}

export function getTokenPayload() {
  const token = getToken();
  return token ? parseJwt(token) : null;
}

export function getUserRole() {
  const payload = getTokenPayload();
  return payload ? payload.role : null;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.success) {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return data.access_token;
    } else {
      throw new Error(data.error || 'Token refresh failed');
    }
  } catch (error) {
    // Remove invalid tokens
    removeToken();
    throw error;
  }
}

export function setupAxiosInterceptors() {
  // This would be used with axios if you were using it
  // For now, we'll handle token refresh in individual fetch calls
}

export async function authenticatedFetch(url, options = {}) {
  let token = getToken();
  
  // Check if token is expired
  if (token && isTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      // Redirect to login if refresh fails
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  }
  
  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
