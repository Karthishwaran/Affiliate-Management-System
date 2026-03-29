import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('/auth/reset-password', {
        token,
        newPassword: formData.password
      });
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      setErrors({ general: error.response?.data?.message || 'Invalid or expired token' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-lg border-0 fade-in">
                <Card.Body className="p-5 text-center">
                  <FaCheckCircle size={64} className="text-success mb-3" />
                  <h3 className="mb-3">Password Reset Successfully!</h3>
                  <p className="text-muted mb-4">
                    Your password has been reset. Redirecting to login...
                  </p>
                  <Link to="/login" className="btn btn-primary">
                    Go to Login
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Reset Password</h2>
                  <p className="text-muted">Enter your new password</p>
                </div>

                {errors.general && <Alert variant="danger">{errors.general}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        className="border-start-0 ps-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        className="border-start-0 ps-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <FaArrowLeft className="me-1" /> Back to Login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;