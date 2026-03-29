import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar />
          <Container fluid className="py-4 flex-grow-1">
            <Outlet />
          </Container>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;