/**
 * Security Configuration for Impact LMS
 * This file contains security-related utilities and constants
 */

// Security levels
export const SECURITY_LEVELS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
};

// Current environment
export const CURRENT_ENV = process.env.NODE_ENV || 'development';

/**
 * Secure logger that filters sensitive information
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
export const secureLog = (level, message, data = {}) => {
  if (CURRENT_ENV === SECURITY_LEVELS.PRODUCTION) {
    // In production, only log errors and warnings
    if (level === 'error' || level === 'warn') {
      console[level](`[${level.toUpperCase()}]`, message, sanitizeLogData(data));
    }
    return;
  }

  // In development, log everything but sanitize sensitive data
  console[level](`[${level.toUpperCase()}]`, message, sanitizeLogData(data));
};

/**
 * Sanitize data for logging by removing sensitive fields
 * @param {object} data - Data object to sanitize
 * @returns {object} - Sanitized data object
 */
export const sanitizeLogData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password', 'token', 'access_token', 'refresh_token',
    'jwt', 'secret', 'key', 'authorization', 'auth',
    'exp', 'iat', 'signature'
  ];

  const sanitized = { ...data };

  // Remove or mask sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      if (typeof sanitized[key] === 'string') {
        // Mask the value, showing only first 4 and last 4 characters for tokens
        const value = sanitized[key];
        if (value.length > 20) {
          sanitized[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
        } else {
          sanitized[key] = '***';
        }
      } else {
        sanitized[key] = '[HIDDEN]';
      }
    }

    // Recursively sanitize nested objects
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Safe JSON stringify that handles circular references and sensitive data
 * @param {any} data - Data to stringify
 * @returns {string} - Safe JSON string
 */
export const safeJSONStringify = (data) => {
  try {
    return JSON.stringify(sanitizeLogData(data), null, 2);
  } catch (error) {
    return '[Unable to stringify data]';
  }
};

/**
 * Development-only assertion function
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message if condition fails
 */
export const devAssert = (condition, message) => {
  if (CURRENT_ENV === SECURITY_LEVELS.DEVELOPMENT && !condition) {
    console.error('DEV ASSERTION FAILED:', message);
  }
};

/**
 * Secure error handler that doesn't expose sensitive information
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {object} - Safe error object for logging/display
 */
export const handleSecureError = (error, context = 'Unknown') => {
  const safeError = {
    message: error.message || 'An error occurred',
    context,
    timestamp: new Date().toISOString()
  };

  // In development, include more details
  if (CURRENT_ENV === SECURITY_LEVELS.DEVELOPMENT) {
    safeError.stack = error.stack;
    safeError.name = error.name;
  }

  return safeError;
};

/**
 * Check if we should show debug information
 * @returns {boolean}
 */
export const shouldShowDebugInfo = () => {
  return CURRENT_ENV === SECURITY_LEVELS.DEVELOPMENT;
};

/**
 * Get safe user info for display/logging
 * @param {object} user - User object or JWT payload
 * @returns {object} - Safe user info
 */
export const getSafeUserInfo = (user) => {
  if (!user) return null;

  return {
    id: user.user_id || user.id,
    username: user.username,
    role: user.role,
    email: user.email ? `${user.email.substring(0, 2)}***@${user.email.split('@')[1]}` : null,
    org_id: user.org_id
  };
};

// Export logger functions with predefined levels
export const logger = {
  info: (message, data) => secureLog('info', message, data),
  warn: (message, data) => secureLog('warn', message, data),
  error: (message, data) => secureLog('error', message, data),
  debug: (message, data) => secureLog('debug', message, data)
};

// Security headers for API requests (if needed)
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

// Allowed domains for CORS (development)
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000'
];

export default {
  secureLog,
  sanitizeLogData,
  safeJSONStringify,
  devAssert,
  handleSecureError,
  shouldShowDebugInfo,
  getSafeUserInfo,
  logger,
  SECURITY_LEVELS,
  CURRENT_ENV
};
