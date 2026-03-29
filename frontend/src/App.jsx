import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/Auth/PrivateRoute';

// Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/affiliate/*" element={<AffiliateDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;