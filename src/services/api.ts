import axios from 'axios';

// API base URL - change this if your backend runs on a different port
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  tutor: string;
  time?: string;
  mode?: string;
  clazz?: string;
  content?: string;
  max_students?: number;
  enrolled_count?: number;
  is_registered?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CourseRegistrationResponse {
  success: boolean;
  message: string;
}

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // You might want to redirect to login page here
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getProtectedData(): Promise<any> {
    const response = await api.get('/protected');
    return response.data;
  },
};

// Course API functions
export const courseAPI = {
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/courses');
    return response.data;
  },

  async getMyCourses(): Promise<Course[]> {
    const response = await api.get('/my-courses');
    return response.data;
  },

  async getCourseDetails(courseCode: string): Promise<Course> {
    const response = await api.get(`/courses/${courseCode}`);
    return response.data;
  },

  async registerForCourse(courseCode: string): Promise<CourseRegistrationResponse> {
    const response = await api.post(`/courses/${courseCode}/register`);
    return response.data;
  },

  async unregisterFromCourse(courseCode: string): Promise<CourseRegistrationResponse> {
    const response = await api.delete(`/courses/${courseCode}/unregister`);
    return response.data;
  },

  async getCourseStatistics(courseCode: string): Promise<any> {
    const response = await api.get(`/courses/${courseCode}/statistics`);
    return response.data;
  },
};

// Helper functions for token management
export const tokenManager = {
  setToken(token: string) {
    localStorage.setItem('access_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  removeToken() {
    localStorage.removeItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// Helper functions for user management
export const userManager = {
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser() {
    localStorage.removeItem('user');
  },
};

export default api;
