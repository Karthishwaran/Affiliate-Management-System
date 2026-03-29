import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-top mt-auto py-4">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <small className="text-muted">
              &copy; {currentYear} Affiliate Management System. All rights reserved.
            </small>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <small className="text-muted">
              Made with <FaHeart className="text-danger" /> for affiliates worldwide
            </small>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <Nav className="justify-content-center justify-content-md-end">
              <Nav.Link 
                href="https://facebook.com" 
                target="_blank" 
                className="text-muted p-0 me-3"
                style={{ fontSize: '1.2rem' }}
              >
                <FaFacebook />
              </Nav.Link>
              <Nav.Link 
                href="https://twitter.com" 
                target="_blank" 
                className="text-muted p-0 me-3"
                style={{ fontSize: '1.2rem' }}
              >
                <FaTwitter />
              </Nav.Link>
              <Nav.Link 
                href="https://linkedin.com" 
                target="_blank" 
                className="text-muted p-0 me-3"
                style={{ fontSize: '1.2rem' }}
              >
                <FaLinkedin />
              </Nav.Link>
              <Nav.Link 
                href="https://github.com" 
                target="_blank" 
                className="text-muted p-0"
                style={{ fontSize: '1.2rem' }}
              >
                <FaGithub />
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
        
        <Row className="mt-3">
          <Col className="text-center">
            <small className="text-muted">
              <Link to="/privacy" className="text-muted text-decoration-none me-3">Privacy Policy</Link>
              <Link to="/terms" className="text-muted text-decoration-none me-3">Terms of Service</Link>
              <Link to="/support" className="text-muted text-decoration-none">Support</Link>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;