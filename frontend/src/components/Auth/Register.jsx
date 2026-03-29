import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Phone number must be 10-15 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const registerData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };
    
    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
        registerData.phone = cleanPhone;
      }
    }
    
    console.log('Submitting registration:', registerData);
    
    const success = await register(registerData);
    
    if (!success) {
      setServerError('Registration failed. Please check your information and try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Create Account</h2>
                  <p className="text-muted">Join our affiliate program today</p>
                </div>

                {serverError && (
                  <Alert variant="danger" className="mb-4">
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaUser className="text-muted" />
                      </span>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        className="border-start-0 ps-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaEnvelope className="text-muted" />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        className="border-start-0 ps-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number (Optional)</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaPhone className="text-muted" />
                      </span>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        isInvalid={!!errors.phone}
                        className="border-start-0 ps-0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Optional - Enter 10-15 digits
                      </Form.Text>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Create a password (min 6 characters)"
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
                    <Form.Label>Confirm Password *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
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
                    className="w-100 mb-3 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <p className="text-center mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Sign in
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;