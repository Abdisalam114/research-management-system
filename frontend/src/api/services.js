import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  approve: (id) => api.patch(`/users/${id}/approve`),
  reject: (id) => api.patch(`/users/${id}/reject`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const proposalsAPI = {
  getAll: (params) => api.get('/proposals', { params }),
  getOne: (id) => api.get(`/proposals/${id}`),
  create: (data) => api.post('/proposals', data),
  update: (id, data) => api.patch(`/proposals/${id}`, data),
  review: (id, data) => api.patch(`/proposals/${id}/review`, data),
  decide: (id, data) => api.patch(`/proposals/${id}/decision`, data),
  delete: (id) => api.delete(`/proposals/${id}`),
};

export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  toggleMilestone: (id, milestoneId) => api.patch(`/projects/${id}/milestone/${milestoneId}`),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const publicationsAPI = {
  getAll: (params) => api.get('/publications', { params }),
  getOne: (id) => api.get(`/publications/${id}`),
  create: (data) => api.post('/publications', data),
  update: (id, data) => api.patch(`/publications/${id}`, data),
  verify: (id) => api.patch(`/publications/${id}/verify`),
  delete: (id) => api.delete(`/publications/${id}`),
};

export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  getByProject: (projectId) => api.get(`/budgets/${projectId}`),
  update: (projectId, data) => api.patch(`/budgets/${projectId}`, data),
  addExpense: (projectId, data) => api.post(`/budgets/${projectId}/expenses`, data),
  deleteExpense: (projectId, expenseId) => api.delete(`/budgets/${projectId}/expenses/${expenseId}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportsAPI = {
  publications: (params) => api.get('/reports/publications', { params }),
  projects: (params) => api.get('/reports/projects', { params }),
};
