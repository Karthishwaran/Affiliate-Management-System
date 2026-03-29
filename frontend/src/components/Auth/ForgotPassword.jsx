import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Forgot Password</h2>
                  <p className="text-muted">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                
                {submitted ? (
                  <Alert variant="success" className="text-center">
                    <p className="mb-2">Password reset link has been sent to:</p>
                    <strong>{email}</strong>
                    <hr />
                    <Link to="/login" className="text-decoration-none">
                      <FaArrowLeft className="me-2" /> Back to Login
                    </Link>
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FaEnvelope className="text-muted" />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="border-start-0 ps-0"
                        />
                      </div>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-decoration-none">
                        <FaArrowLeft className="me-1" /> Back to Login
                      </Link>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;