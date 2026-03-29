import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AffiliatesList from '../components/Admin/AffiliatesList';
import Payouts from '../components/Admin/Payouts';
import Reports from '../components/Admin/Reports';
import CommissionSettings from '../components/Admin/CommissionSettings';

const AdminDashboardPage = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/affiliates" element={<AffiliatesList />} />
      <Route path="/payouts" element={<Payouts />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/commissions" element={<CommissionSettings />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminDashboardPage;