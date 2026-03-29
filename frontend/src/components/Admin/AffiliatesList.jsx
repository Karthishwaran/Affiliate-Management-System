import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/payouts');
      setPayouts(response.data.data.payouts);
    } catch (error) {
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    setProcessing(true);
    try {
      await axios.post(`/admin/payouts/${selectedPayout._id}/process`);
      toast.success('Payout processed successfully');
      setShowProcessModal(false);
      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <Loading />;

  return (
    <Container fluid>
      <h2 className="mb-4">Payout Management</h2>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Amount</th>
                <th>Net Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(payout => (
                <tr key={payout._id}>
                  <td>
                    <code>{payout.affiliateId?.affiliateCode}</code>
                    <br />
                    <small className="text-muted">{payout.affiliateId?.paymentEmail}</small>
                  </td>
                  <td>${payout.amount?.toFixed(2)}</td>
                  <td>${payout.netAmount?.toFixed(2)}</td>
                  <td>{payout.paymentMethod}</td>
                  <td>{getStatusBadge(payout.status)}</td>
                  <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                  <td>
                    {payout.status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowProcessModal(true);
                        }}
                      >
                        <FaMoneyBillWave className="me-1" /> Process
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No payout requests found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Process Payout Modal */}
      <Modal show={showProcessModal} onHide={() => setShowProcessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayout && (
            <>
              <Alert variant="info">
                <strong>Payout Details:</strong><br />
                Affiliate: {selectedPayout.affiliateId?.affiliateCode}<br />
                Amount: ${selectedPayout.amount?.toFixed(2)}<br />
                TDS: ${selectedPayout.tdsAmount?.toFixed(2)}<br />
                Net Amount: ${selectedPayout.netAmount?.toFixed(2)}<br />
                Payment Method: {selectedPayout.paymentMethod}
              </Alert>
              
              <Alert variant="warning">
                <strong>Payment Details:</strong><br />
                {selectedPayout.paymentMethod === 'PayPal' && (
                  <>PayPal Email: {selectedPayout.paymentDetails?.paypalEmail}</>
                )}
                {selectedPayout.paymentMethod === 'Bank Transfer' && (
                  <>
                    Account: {selectedPayout.paymentDetails?.bankDetails?.accountNumber}<br />
                    Bank: {selectedPayout.paymentDetails?.bankDetails?.bankName}
                  </>
                )}
                {selectedPayout.paymentMethod === 'UPI' && (
                  <>UPI ID: {selectedPayout.paymentDetails?.upiId}</>
                )}
              </Alert>
              
              <Alert variant="danger">
                <strong>Confirm:</strong> This action will transfer the money to the affiliate's account.
                Please ensure all details are correct before proceeding.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleProcessPayout}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Confirm & Process'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payouts;
