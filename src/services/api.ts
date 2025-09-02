import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from localStorage
      localStorage.removeItem('token');
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {

  sendSignupOTP: (data: { email: string; name: string }) =>
    api.post('/auth/send-signup-otp', data),


  sendLoginOTP: (data: { email: string }) =>
    api.post('/auth/send-login-otp', data),


  signup: (data: { name: string; email: string; dob: string; otp: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; otp: string; rememberMe?: boolean }) =>
    api.post('/auth/login', data),


  googleAuth: (data: { idToken: string }) =>
    api.post('/auth/google', data),


  getCurrentUser: () =>
    api.get('/auth/me'),


  logout: () =>
    api.post('/auth/logout'),
};

// Notes API endpoints
export const notesAPI = {

  getNotes: () =>
    api.get('/notes'),


  createNote: (data: { title: string; content: string }) =>
    api.post('/notes', data),


  updateNote: (id: number, data: { title?: string; content?: string }) =>
    api.put(`/notes/${id}`, data),


  deleteNote: (id: number) =>
    api.delete(`/notes/${id}`),
};

export default api;