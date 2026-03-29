import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSave, FaIdCard, FaUniversity, FaPaypal } from 'react-icons/fa';
import Loading from '../Common/Loading';
import KYCUpload from './KYCUpload';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    website: '',
    niche: '',
    promotionMethods: [],
    audienceSize: '',
    paymentEmail: '',
    preferredPaymentMethod: 'PayPal',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: ''
    },
    upiId: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/affiliate/profile');
      setProfile(response.data.data);
      setFormData({
        website: response.data.data.website || '',
        niche: response.data.data.niche || '',
        promotionMethods: response.data.data.promotionMethods || [],
        audienceSize: response.data.data.audienceSize || '',
        paymentEmail: response.data.data.paymentEmail || user?.email,
        preferredPaymentMethod: response.data.data.preferredPaymentMethod || 'PayPal',
        bankDetails: response.data.data.bankDetails || {
          accountHolderName: '',
          accountNumber: '',
          bankName: '',
          ifscCode: ''
        },
        upiId: response.data.data.upiId || ''
      });
    } catch(error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handlePromotionMethods = (method) => {
    setFormData(prev => {
      const methods = [...prev.promotionMethods];
      if (methods.includes(method)) {
        return { ...prev, promotionMethods: methods.filter(m => m !== method) };
      } else {
        return { ...prev, promotionMethods: [...methods, method] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put('/affiliate/profile', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const niches = ['Technology', 'Fashion', 'Health', 'Finance', 'Gaming', 'Travel', 'Education', 'Other'];
  const promotionOptions = ['Blog', 'Social Media', 'Email Marketing', 'YouTube', 'Paid Ads', 'Other'];

  return (
    <Container fluid>
      <h2 className="mb-4">Profile Settings</h2>
      
      <Row>
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                     style={{ width: '100px', height: '100px', fontSize: '40px' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h5>{user?.name}</h5>
              <p className="text-muted">{user?.email}</p>
              <Badge bg={profile?.status === 'approved' ? 'success' : 'warning'}>
                {profile?.status || 'Pending'}
              </Badge>
              <hr />
              <div className="text-start">
                <small className="text-muted">Affiliate Code:</small>
                <p className="fw-bold mb-0">{profile?.affiliateCode}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="profile" className="mb-3">
                <Tab eventKey="profile" title="Profile Information">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Website/Blog URL</Form.Label>
                          <Form.Control
                            type="url"
                            name="website"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Niche</Form.Label>
                          <Form.Select
                            name="niche"
                            value={formData.niche}
                            onChange={handleChange}
                          >
                            <option value="">Select niche</option>
                            {niches.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Promotion Methods</Form.Label>
                      <div>
                        {promotionOptions.map(method => (
                          <Form.Check
                            key={method}
                            inline
                            label={method}
                            type="checkbox"
                            checked={formData.promotionMethods.includes(method)}
                            onChange={() => handlePromotionMethods(method)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Audience Size</Form.Label>
                      <Form.Control
                        type="number"
                        name="audienceSize"
                        placeholder="Number of followers/subscribers"
                        value={formData.audienceSize}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" disabled={saving}>
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Form>
                </Tab>
                
                <Tab eventKey="payment" title="Payment Settings">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="paymentEmail"
                        value={formData.paymentEmail}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Email for PayPal payments
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Preferred Payment Method</Form.Label>
                      <Form.Select
                        name="preferredPaymentMethod"
                        value={formData.preferredPaymentMethod}
                        onChange={handleChange}
                      >
                        <option value="PayPal">PayPal</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                      </Form.Select>
                    </Form.Group>
                    
                    {formData.preferredPaymentMethod === 'Bank Transfer' && (
                      <>
                        <h6 className="mt-4 mb-3">
                          <FaUniversity className="me-2" /> Bank Details
                        </h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Account Holder Name</Form.Label>
                              <Form.Control
                                name="accountHolderName"
                                value={formData.bankDetails.accountHolderName}
                                onChange={handleBankChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Account Number</Form.Label>
                              <Form.Control
                                name="accountNumber"
                                value={formData.bankDetails.accountNumber}
                                onChange={handleBankChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Bank Name</Form.Label>
                              <Form.Control
                                name="bankName"
                                value={formData.bankDetails.bankName}
                                onChange={handleBankChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>IFSC Code</Form.Label>
                              <Form.Control
                                name="ifscCode"
                                value={formData.bankDetails.ifscCode}
                                onChange={handleBankChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}
                    
                    {formData.preferredPaymentMethod === 'UPI' && (
                      <Form.Group className="mb-3">
                        <Form.Label>UPI ID</Form.Label>
                        <Form.Control
                          name="upiId"
                          placeholder="example@upi"
                          value={formData.upiId}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    )}
                    
                    <Button onClick={handleSubmit} variant="primary" disabled={saving}>
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Payment Settings'}
                    </Button>
                  </Form>
                </Tab>
                
                <Tab eventKey="kyc" title="KYC Verification">
                  <KYCUpload />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;