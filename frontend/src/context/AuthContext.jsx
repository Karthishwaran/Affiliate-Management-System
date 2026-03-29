import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  console.trace('useAuth called from:'); // This will show the call stack
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside AuthProvider');
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('✅ AuthProvider is rendering - this should appear in console');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 
  
  

  // Set axios default config
  axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/affiliate/profile');
      setUser(response.data.data);
    } catch (error) {
      console.error('Fetch user error:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, refreshToken, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      toast.success('Login successful! Welcome back!');
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/affiliate');
      }
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      
      const response = await axios.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || ''
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        toast.success('Registration successful! Please login to continue.');
        navigate('/login');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(e => e.msg).join(', ');
        toast.error(errorMessages);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      toast.info('Logged out successfully');
      navigate('/login');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};