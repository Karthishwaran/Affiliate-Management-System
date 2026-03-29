import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Earnings = () => {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commissionsRes, summaryRes] = await Promise.all([
        axios.get('/commissions'),
        axios.get('/commissions/summary')
      ]);
      setCommissions(commissionsRes.data.data.commissions);
      setSummary(summaryRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || payoutAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      await axios.post('/payouts/request', {
        amount: parseFloat(payoutAmount),
        paymentMethod
      });
      toast.success('Payout request submitted successfully!');
      setShowPayoutModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request payout');
    }
  };

  if (loading) return <Loading />;

  return (
    <Container fluid>
      <h2 className="mb-4">My Earnings</h2>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-primary h-100">
            <Card.Body>
              <h6 className="text-muted">Total Earnings</h6>
              <h3 className="mb-0">${summary?.total?.toFixed(2) || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-warning h-100">
            <Card.Body>
              <h6 className="text-muted">Pending Commission</h6>
              <h3 className="mb-0">${summary?.pending?.toFixed(2) || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-success h-100">
            <Card.Body>
              <h6 className="text-muted">Paid Commission</h6>
              <h3 className="mb-0">${summary?.paid?.toFixed(2) || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-info h-100">
            <Card.Body>
              <h6 className="text-muted">Available for Payout</h6>
              <h3 className="mb-0">${summary?.pending?.toFixed(2) || 0}</h3>
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2 w-100"
                onClick={() => setShowPayoutModal(true)}
                disabled={!summary?.pending || summary.pending < 50}
              >
                <FaWallet className="me-2" />
                Request Payout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Commission History */}
      <Card className="shadow-sm">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Commission History</h5>
            <Button variant="outline-secondary" size="sm">
              <FaDownload className="me-1" /> Export
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(commission => (
                <tr key={commission._id}>
                  <td><code>{commission.orderId}</code></td>
                  <td>${commission.conversionId?.amount?.toFixed(2) || 0}</td>
                  <td className="fw-bold">${commission.amount?.toFixed(2)}</td>
                  <td>{commission.rate}%</td>
                  <td>
                    <Badge bg={
                      commission.status === 'paid' ? 'success' :
                      commission.status === 'approved' ? 'info' : 'warning'
                    }>
                      {commission.status}
                    </Badge>
                  </td>
                  <td>{new Date(commission.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No commission records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Payout Modal */}
      <Modal show={showPayoutModal} onHide={() => setShowPayoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            Minimum payout amount: $50.00<br />
            Available balance: ${summary?.pending?.toFixed(2) || 0}
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="50"
              max={summary?.pending}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayoutModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRequestPayout}>
            <FaMoneyBillWave className="me-2" />
            Request Payout
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Earnings;