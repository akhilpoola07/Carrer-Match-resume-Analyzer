import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
if (import.meta.env.PROD) {
  if (!configuredApiUrl) {
    throw new Error('VITE_API_URL must point to the production API before building the frontend.');
  }
  let productionUrl: URL;
  try {
    productionUrl = new URL(configuredApiUrl);
  } catch {
    throw new Error('VITE_API_URL must be an absolute HTTPS URL in production.');
  }
  if (productionUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(productionUrl.hostname)) {
    throw new Error('VITE_API_URL must use HTTPS and cannot point to a local address in production.');
  }
}
const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5001' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  file_name: string;
  created_at: string;
  text_length?: number;
  extracted_text?: string;
}

export interface Analysis {
  id: number;
  user_id: number;
  resume_id: number;
  company_name: string;
  job_role: string;
  ats_score: number;
  job_location?: string;
  skills_score: number;
  keyword_score: number;
  experience_score: number;
  education_score: number;
  completeness_score: number;
  keyword_coverage: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  created_at: string;
  resume_file_name?: string;
  job_description?: string;
  experience_analysis?: any;
  education_analysis?: any;
  completeness_analysis?: any;
  ai_suggestions?: any;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string, confirmPassword: string) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Resumes API
export const resumesAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/api/resumes');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/resumes/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/resumes/${id}`);
    return response.data;
  },
};

// Analyses API
export const analysesAPI = {
  create: async (data: {
    resume_id: number;
    company_name: string;
    job_role: string;
    job_location?: string;
    job_description: string;
  }) => {
    const response = await api.post('/api/analyses', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/api/analyses');
    return response.data as ApiEnvelope<{ analyses: Analysis[] }>;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/analyses/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/analyses/${id}`);
    return response.data;
  },
};

export default api;
