import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={6}>
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="lead mb-4">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Button as={Link} to="/" variant="primary" size="lg">
              <FaHome className="me-2" /> Back to Home
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;