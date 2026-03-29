import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getAffiliates = async (params) => {
  const response = await api.get('/admin/affiliates', { params });
  return response.data;
};

export const getAffiliateDetails = async (id) => {
  const response = await api.get(`/admin/affiliates/${id}`);
  return response.data;
};

export const approveAffiliate = async (id) => {
  const response = await api.put(`/admin/affiliates/${id}/approve`);
  return response.data;
};

export const rejectAffiliate = async (id, reason) => {
  const response = await api.put(`/admin/affiliates/${id}/reject`, { reason });
  return response.data;
};

export const getAllPayouts = async (params) => {
  const response = await api.get('/admin/payouts', { params });
  return response.data;
};

export const processPayout = async (id) => {
  const response = await api.post(`/admin/payouts/${id}/process`);
  return response.data;
};

export const updateCommissionStatus = async (id, status) => {
  const response = await api.put(`/admin/commissions/${id}/status`, { status });
  return response.data;
};

export const getAdminReports = async (params) => {
  const response = await api.get('/reports/admin', { params });
  return response.data;
};