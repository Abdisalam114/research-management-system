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
  getProfile: (id) => api.get(`/users/${id}/profile`),
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
  assignReviewer: (id, data) => api.patch(`/proposals/${id}/assign-reviewer`, data),
  review: (id, data) => api.patch(`/proposals/${id}/review`, data),
  updateEthics: (id, data) => api.patch(`/proposals/${id}/ethics`, data),
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

export const grantsAPI = {
  getAll: (params) => api.get('/grants', { params }),
  getOne: (id) => api.get(`/grants/${id}`),
  create: (data) => api.post('/grants', data),
  update: (id, data) => api.patch(`/grants/${id}`, data),
  review: (id, data) => api.patch(`/grants/${id}/review`, data),
  delete: (id) => api.delete(`/grants/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const researchGroupsAPI = {
  getAll: (params) => api.get('/research-groups', { params }),
  getOne: (id) => api.get(`/research-groups/${id}`),
  create: (data) => api.post('/research-groups', data),
  update: (id, data) => api.patch(`/research-groups/${id}`, data),
  delete: (id) => api.delete(`/research-groups/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const repositoryAPI = {
  getAll: (params) => api.get('/repository', { params }),
  getOne: (id) => api.get(`/repository/${id}`),
  create: (data) => api.post('/repository', data),
  update: (id, data) => api.patch(`/repository/${id}`, data),
  delete: (id) => api.delete(`/repository/${id}`),
  getStats: () => api.get('/repository/stats'),
};

export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  getOne: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
  markRead: (id) => api.patch(`/conversations/${id}/read`),
};

export const reportsAPI = {
  publications: (params) => api.get('/reports/publications', { params }),
  projects: (params) => api.get('/reports/projects', { params }),
  grants: (params) => api.get('/reports/grants', { params }),
  budgetUtilization: (params) => api.get('/reports/budget-utilization', { params }),
  facultyProductivity: (params) => api.get('/reports/faculty-productivity', { params }),
};

