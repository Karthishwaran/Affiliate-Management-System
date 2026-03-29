import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBell, FaCog } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm px-4">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary d-lg-none">
          AffiliateSystem
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
        
        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Notifications */}
            <Nav.Link href="#" className="position-relative">
              <FaBell size={20} />
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                3
              </Badge>
            </Nav.Link>
            
            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-dark text-decoration-none d-flex align-items-center">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                     style={{ width: '35px', height: '35px' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="ms-2 d-none d-md-inline">{user?.name}</span>
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2" /> Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">
                  <FaCog className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;