import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-4">
      <Container>
        <Row>
          <Col className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} Affiliate Management System. All rights reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;