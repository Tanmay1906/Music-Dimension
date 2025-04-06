import axios from 'axios';

// Use relative URL instead of absolute URL to work with the proxy
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  
  // Try different endpoint paths
  registerAlt1: (username, email, password) => 
    api.post('/register', { username, email, password }),
  
  registerAlt2: (username, email, password) => 
    api.post('/users/register', { username, email, password }),
};

// Music services
export const musicService = {
  searchTracks: (query) => 
    api.get(`/music/search?query=${encodeURIComponent(query)}`),
  
  getPopularTracks: () => 
    api.get('/music/popular'),
};

export default api;