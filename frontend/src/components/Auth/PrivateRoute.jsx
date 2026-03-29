import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import Loading from '../Common/Loading';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;