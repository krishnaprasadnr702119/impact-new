/**
 * API utility functions with token-based authentication
 */

import { getToken, refreshAccessToken, removeToken, isTokenExpired } from './auth';
import { logger } from './security';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Base API class for handling authenticated requests
 */
class Api {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async makeRequest(endpoint, options = {}) {
    let token = getToken();

    // Check if token is expired and try to refresh
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        // Redirect to login if refresh fails
        removeToken();
        window.location.href = '/login';
        throw new ApiError('Authentication required', 401);
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Secure debug logging
    logger.debug('🔍 API Request', {
      method: config.method,
      url: url.replace(this.baseURL, ''), // Remove base URL for cleaner logs
      hasToken: !!token
    });

    try {
      const response = await fetch(url, config);

      // Handle 401 responses (token expired/invalid)
      if (response.status === 401) {
        // For notification endpoints, don't redirect - fail gracefully
        if (endpoint.includes('/notifications')) {
          throw new ApiError('Authentication required', 401);
        }

        // Try to refresh token once
        if (token) {
          try {
            const newToken = await refreshAccessToken();
            config.headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);

            if (retryResponse.ok) {
              return await this.parseResponse(retryResponse);
            } else {
              throw new ApiError('Authentication failed', retryResponse.status);
            }
          } catch (refreshError) {
            removeToken();
            window.location.href = '/login';
            throw new ApiError('Authentication required', 401);
          }
        } else {
          removeToken();
          window.location.href = '/login';
          throw new ApiError('Authentication required', 401);
        }
      }

      const data = await this.parseResponse(response);

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  /**
   * Safely parse response as JSON, with fallback
   */
  async parseResponse(response) {
    try {
      const contentType = response.headers.get('content-type');

      // Check if response has content
      const text = await response.text();

      if (!text) {
        return {
          success: response.ok,
          message: response.ok ? 'Success' : `HTTP ${response.status}`
        };
      }

      // Try to parse as JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(text);
        } catch (jsonError) {
          logger.warn('Failed to parse JSON response', {
            status: response.status,
            contentType: contentType,
            textLength: text.length
          });
          return {
            success: response.ok,
            message: text || `HTTP ${response.status}`,
            raw: text
          };
        }
      }

      // If not JSON, return as is
      return {
        success: response.ok,
        message: text || `HTTP ${response.status}`,
        raw: text
      };
    } catch (error) {
      logger.error('Error parsing response', { error: error.message });
      throw new ApiError('Failed to parse response', 0, { error: error.message });
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.makeRequest(url);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async uploadFile(endpoint, formData) {
    let token = getToken();

    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        removeToken();
        window.location.href = '/login';
        throw new ApiError('Authentication required', 401);
      }
    }

    const config = {
      method: 'POST',
      body: formData,
    };

    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const data = await this.parseResponse(response);
      throw new ApiError(
        data.error || data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return await this.parseResponse(response);
  }
}

// Create API instance
const api = new Api('/api');

// Specific API functions
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  refresh: (refreshToken) => api.post('/refresh', { refresh_token: refreshToken }),
  verifyToken: () => api.get('/verify-token'),
};

export const adminApi = {
  getSystemStats: () => api.get('/admin/system_stats'),
  getPortalAdmins: () => api.get('/admin/portal_admins'),
  getAllUsers: () => api.get('/admin/all_users'),
  getCourseRequests: () => api.get('/admin/course_requests'),
  approveCourseRequest: (requestId, status) =>
    api.post('/admin/approve_course_request', { request_id: requestId, status }),
  getEmailSettings: () => api.get('/admin/email_settings'),
  updateEmailSettings: (settings) => api.post('/admin/email_settings', { settings }),
  testEmail: (testEmail) => api.post('/admin/test_email', { test_email: testEmail }),
};

export const portalAdminApi = {
  assignCourseToAll: (courseId) => api.post('/portal_admin/assign_course_to_all', { course_id: courseId }),
  unassignCourse: (courseId) => api.delete(`/portal_admin/unassign_course/${courseId}`),
  createEmployee: (employeeData) => api.post('/portal_admin/create_employee', employeeData),
  inviteEmployee: (inviteData) => api.post('/portal_admin/invite_employee', inviteData),
  resetEmployeePassword: (employeeId) => api.post('/portal_admin/reset_employee_password', { employee_id: employeeId }),
  getOrganizationEmployees: (orgId) => api.get(`/portal_admin/organizations/${orgId}/employees`),
  getOrganizationCourses: (orgId) => api.get(`/portal_admin/organizations/${orgId}/courses`),
  getMyCourseRequests: () => api.get('/portal_admin/my_course_requests'),
  requestCourse: (courseData) => api.post('/portal_admin/request_course', courseData),
  getAllCourses: () => api.get('/portal_admin/all_courses'),
};

export const employeeApi = {
  getMyCourses: () => api.get('/employee/my_courses'),
  getCourse: (courseId) => api.get(`/employee/course/${courseId}`),
  getContent: (contentId) => api.get(`/employee/content/${contentId}`),
  getQuiz: (quizId) => api.get(`/employee/quiz/${quizId}`),
  submitQuiz: (quizData) => api.post('/employee/submit_quiz', quizData),
  updateProgress: (progressData) => api.post('/employee/update_progress', progressData),
  markCourseComplete: (courseData) => api.post('/employee/mark_course_complete', courseData),
};

export const courseApi = {
  getAllCourses: () => api.get('/courses'),
  getCourse: (courseId) => api.get(`/courses/${courseId}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (courseId, courseData) => api.put(`/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),
  addModule: (courseId, moduleData) => api.post(`/courses/${courseId}/modules`, moduleData),
};

export const organizationApi = {
  getAllOrganizations: () => api.get('/organizations'),
  createOrganization: (orgData) => api.post('/organizations', orgData),
  assignCourses: (orgId, courseIds) =>
    api.post(`/organizations/${orgId}/assign_courses`, { course_ids: courseIds }),
  deleteOrganization: (orgId) => api.delete(`/organizations/${orgId}`),
  updateStatus: (orgId, status) => api.patch(`/organizations/${orgId}/status`, { status }),
};

// Export the main API instance and error class
export { api, ApiError };
export default api;
