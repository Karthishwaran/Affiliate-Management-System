import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRocket, FaChartLine, FaWallet, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Earn More with Our Affiliate Program
              </h1>
              <p className="lead mb-4">
                Join thousands of successful affiliates and start earning commissions today.
                Track referrals, manage payouts, and grow your income.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/register" variant="light" size="lg">
                  Get Started Free
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src="https://via.placeholder.com/500x400?text=Affiliate+Marketing" 
                alt="Affiliate Marketing"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose Us?</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <FaRocket size={48} className="text-primary mb-3" />
                  <h5>High Commission Rates</h5>
                  <p className="text-muted">Earn up to 30% commission on every sale</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <FaChartLine size={48} className="text-primary mb-3" />
                  <h5>Real-time Analytics</h5>
                  <p className="text-muted">Track your performance with detailed reports</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <FaWallet size={48} className="text-primary mb-3" />
                  <h5>Fast Payouts</h5>
                  <p className="text-muted">Get paid weekly via PayPal or bank transfer</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <FaShieldAlt size={48} className="text-primary mb-3" />
                  <h5>Secure Platform</h5>
                  <p className="text-muted">Advanced fraud protection and secure payments</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to Start Earning?</h2>
          <p className="lead mb-4">Join our affiliate program today and start growing your income</p>
          <Button as={Link} to="/register" variant="primary" size="lg">
            Sign Up Now - It's Free!
          </Button>
        </Container>
      </section>
    </>
  );
};

export default Home;