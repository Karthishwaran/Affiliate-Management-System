import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/affiliate/dashboard/stats');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/affiliate/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/affiliate/profile', data);
  return response.data;
};

export const uploadKYC = async (formData) => {
  const response = await api.post('/affiliate/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getPerformanceMetrics = async (params) => {
  const response = await api.get('/affiliate/performance/metrics', { params });
  return response.data;
};

export const getLinks = async () => {
  const response = await api.get('/links');
  return response.data;
};

export const createLink = async (data) => {
  const response = await api.post('/links/create', data);
  return response.data;
};

export const updateLink = async (id, data) => {
  const response = await api.put(`/links/${id}`, data);
  return response.data;
};

export const deleteLink = async (id) => {
  const response = await api.delete(`/links/${id}`);
  return response.data;
};

export const getCommissions = async (params) => {
  const response = await api.get('/commissions', { params });
  return response.data;
};

export const getCommissionSummary = async () => {
  const response = await api.get('/commissions/summary');
  return response.data;
};

export const requestPayout = async (data) => {
  const response = await api.post('/payouts/request', data);
  return response.data;
};

export const getPayoutHistory = async () => {
  const response = await api.get('/payouts');
  return response.data;
};

export const getCreatives = async () => {
  const response = await api.get('/creatives');
  return response.data;
};

export const getCreativeCode = async (id) => {
  const response = await api.get(`/creatives/${id}/code`);
  return response.data;
};