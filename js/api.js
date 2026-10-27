/**
 * Blogify - api.js
 * Centralized API client service for communicating with the Node.js/Express REST backend.
 * Provides unified request handling, JWT token attachment, and fallback support.
 */

// Base URL for the Express backend REST API
const API_BASE_URL = 'http://localhost:5000/api';

// Storage key for user JWT and profile
const AUTH_TOKEN_KEY = 'blogify_jwt_token';
const AUTH_USER_KEY = 'blogify_current_user';

/**
 * Retrieve the active JWT token from LocalStorage
 * Note on security: While LocalStorage allows persistence across sessions for demo projects,
 * in sensitive enterprise environments, httpOnly, secure, sameSite cookies are preferred
 * to mitigate XSS (Cross-Site Scripting) exposure.
 */
function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Universal API Fetch Helper with JSON serialization and Bearer token attachment
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data && data.message ? data.message : `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend server is offline or unreachable, annotate for graceful UX
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      const networkError = new Error('Backend server is unreachable. Please ensure the Express server is running on port 5000.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

// --------------------------------------------------------------------------
// Auth API Services
// --------------------------------------------------------------------------
const AuthAPI = {
  async register(name, email, password) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getMe() {
    return await apiRequest('/auth/me', {
      method: 'GET'
    });
  }
};

// --------------------------------------------------------------------------
// Blog API Services
// --------------------------------------------------------------------------
const BlogAPI = {
  async getPublishedBlogs(search = '', category = 'all') {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (category && category !== 'all') params.append('category', category);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/blogs${queryString}`, {
      method: 'GET'
    });
  },

  async getMyBlogs() {
    return await apiRequest('/blogs/my', {
      method: 'GET'
    });
  },

  async getBlogById(id) {
    return await apiRequest(`/blogs/${id}`, {
      method: 'GET'
    });
  },

  async createBlog(blogData) {
    return await apiRequest('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
  },

  async updateBlog(id, blogData) {
    return await apiRequest(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
  },

  async deleteBlog(id) {
    return await apiRequest(`/blogs/${id}`, {
      method: 'DELETE'
    });
  }
};
