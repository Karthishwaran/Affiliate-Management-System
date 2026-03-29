import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Affiliate/Dashboard';
import Profile from '../components/Affiliate/Profile';
import Links from '../components/Affiliate/Links';
import Earnings from '../components/Affiliate/Earnings';
import Creatives from '../components/Affiliate/Creatives';
import Reports from '../components/Affiliate/Reports';

const AffiliateDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/links" element={<Links />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/creatives" element={<Creatives />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="*" element={<Navigate to="/affiliate" replace />} />
    </Routes>
  );
};

export default AffiliateDashboard;