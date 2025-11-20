import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services pour les différentes entités
export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const clientsService = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  convertToClient: (id: string) => api.post(`/clients/${id}/convert-to-client`),
};

export const articlesService = {
  getAll: (params?: any) => api.get('/articles', { params }),
  getById: (id: string) => api.get(`/articles/${id}`),
  create: (data: any) => api.post('/articles', data),
  update: (id: string, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
  getFamilles: () => api.get('/articles/familles/list'),
  getSousFamilles: (famille?: string) => api.get('/articles/sous-familles/list', { params: { famille } }),
  getMouvements: (id: string, params?: any) => api.get(`/articles/${id}/mouvements`, { params }),
};

export const commandesService = {
  getAll: (params?: any) => api.get('/commandes', { params }),
  getById: (id: string) => api.get(`/commandes/${id}`),
  create: (data: any) => api.post('/commandes', data),
  update: (id: string, data: any) => api.put(`/commandes/${id}`, data),
  valider: (id: string) => api.put(`/commandes/${id}/valider`),
};

export const stockService = {
  getWhere: (articleId: string) => api.get('/stock/where', { params: { article_id: articleId } }),
  getSeuils: (agenceId?: string) => api.get('/stock/seuils', { params: { agence_id: agenceId } }),
  transfert: (data: any) => api.post('/stock/transferts', data),
  inventaire: (data: any) => api.post('/stock/inventaires', data),
  bcg: (data: any) => api.post('/stock/bcg', data),
};

export const rhepService = {
  employees: {
    getAll: (params?: any) => api.get('/rhep/employees', { params }),
    create: (data: any) => api.post('/rhep/employees', data),
    update: (id: string, data: any) => api.put(`/rhep/employees/${id}`, data),
  },
  attendance: {
    getAll: (params?: any) => api.get('/rhep/attendance', { params }),
    create: (data: any) => api.post('/rhep/attendance', data),
  },
  leaves: {
    getAll: (params?: any) => api.get('/rhep/leaves', { params }),
    create: (data: any) => api.post('/rhep/leaves', data),
    approve: (id: string, data: any) => api.put(`/rhep/leaves/${id}/approve`, data),
  },
  commissions: {
    getAll: (params?: any) => api.get('/rhep/commissions', { params }),
    calc: (periode: string) => api.post('/rhep/commissions/calc', null, { params: { periode } }),
  },
  expenses: {
    getAll: (params?: any) => api.get('/rhep/expenses', { params }),
    create: (data: any) => api.post('/rhep/expenses', data),
    approve: (id: string, data: any) => api.put(`/rhep/expenses/${id}/approve`, data),
  },
};















