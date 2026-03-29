import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Alert, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaMoneyBillWave, FaSearch, FaFilter, FaDownload, FaEye } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalProcessed: 0,
    totalFailed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPayouts();
  }, [filters]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };
      const response = await axios.get('/admin/payouts', { params });
      setPayouts(response.data.data.payouts);
      
      // Calculate summary
      const payoutsData = response.data.data.payouts;
      const summaryData = {
        totalPending: payoutsData.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        totalProcessed: payoutsData.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        totalFailed: payoutsData.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
        totalAmount: payoutsData.reduce((sum, p) => sum + p.amount, 0)
      };
      setSummary(summaryData);
    } catch (error) {
      toast.error('Failed to fetch payouts');
      console.error(error);
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

  const handleBulkProcess = async () => {
    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    if (pendingPayouts.length === 0) {
      toast.info('No pending payouts to process');
      return;
    }
    
    if (window.confirm(`Process ${pendingPayouts.length} pending payouts?`)) {
      setProcessing(true);
      let success = 0;
      let failed = 0;
      
      for (const payout of pendingPayouts) {
        try {
          await axios.post(`/admin/payouts/${payout._id}/process`);
          success++;
        } catch (error) {
          failed++;
          console.error(`Failed to process payout ${payout._id}:`, error);
        }
      }
      
      toast.success(`Processed ${success} payouts successfully. Failed: ${failed}`);
      fetchPayouts();
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Payout ID', 'Affiliate Code', 'Amount', 'Net Amount', 'TDS', 'Method', 'Status', 'Date', 'Transaction ID'];
    const rows = payouts.map(payout => [
      payout._id,
      payout.affiliateId?.affiliateCode || 'N/A',
      payout.amount,
      payout.netAmount,
      payout.tdsAmount || 0,
      payout.paymentMethod,
      payout.status,
      new Date(payout.createdAt).toLocaleDateString(),
      payout.transactionId || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payouts-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Export completed');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'} className="px-3 py-2">{status.toUpperCase()}</Badge>;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      PayPal: '💳',
      'Bank Transfer': '🏦',
      UPI: '📱'
    };
    return icons[method] || '💰';
  };

  const filteredPayouts = payouts.filter(payout => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payout._id.toLowerCase().includes(searchLower) ||
      payout.affiliateId?.affiliateCode?.toLowerCase().includes(searchLower) ||
      payout.paymentMethod?.toLowerCase().includes(searchLower) ||
      payout.transactionId?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <Loading />;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Payout Management</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={exportToCSV}>
            <FaDownload className="me-2" /> Export CSV
          </Button>
          <Button variant="success" onClick={handleBulkProcess} disabled={processing}>
            <FaMoneyBillWave className="me-2" />
            Bulk Process
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-warning h-100">
            <Card.Body>
              <h6 className="text-muted">Pending Payouts</h6>
              <h3 className="mb-0">${summary.totalPending.toFixed(2)}</h3>
              <small className="text-muted">
                {payouts.filter(p => p.status === 'pending').length} requests
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-success h-100">
            <Card.Body>
              <h6 className="text-muted">Processed Payouts</h6>
              <h3 className="mb-0">${summary.totalProcessed.toFixed(2)}</h3>
              <small className="text-muted">
                {payouts.filter(p => p.status === 'completed').length} completed
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-danger h-100">
            <Card.Body>
              <h6 className="text-muted">Failed Payouts</h6>
              <h3 className="mb-0">${summary.totalFailed.toFixed(2)}</h3>
              <small className="text-muted">
                {payouts.filter(p => p.status === 'failed').length} failed
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card stat-card-primary h-100">
            <Card.Body>
              <h6 className="text-muted">Total Payouts</h6>
              <h3 className="mb-0">${summary.totalAmount.toFixed(2)}</h3>
              <small className="text-muted">All time total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <FaSearch className="me-1" /> Search
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, affiliate, method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button variant="secondary" onClick={() => setFilters({ status: '', paymentMethod: '', startDate: '', endDate: '' })}>
                <FaFilter /> Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Payouts Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Affiliate</th>
                  <th>Amount</th>
                  <th>Net Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map(payout => (
                  <tr key={payout._id}>
                    <td>
                      <code className="small">{payout._id.slice(-8)}</code>
                    </td>
                    <td>
                      <strong>{payout.affiliateId?.affiliateCode}</strong>
                      <br />
                      <small className="text-muted">{payout.affiliateId?.paymentEmail}</small>
                    </td>
                    <td className="fw-bold">${payout.amount?.toFixed(2)}</td>
                    <td>${payout.netAmount?.toFixed(2)}</td>
                    <td>
                      <span className="me-2">{getPaymentMethodIcon(payout.paymentMethod)}</span>
                      {payout.paymentMethod}
                      {payout.tdsAmount > 0 && (
                        <small className="text-muted d-block">TDS: ${payout.tdsAmount?.toFixed(2)}</small>
                      )}
                    </td>
                    <td>{getStatusBadge(payout.status)}</td>
                    <td>
                      {new Date(payout.createdAt).toLocaleDateString()}
                      <br />
                      <small className="text-muted">{new Date(payout.createdAt).toLocaleTimeString()}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowDetailsModal(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                        {payout.status === 'pending' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowProcessModal(true);
                            }}
                          >
                            <FaMoneyBillWave />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayouts.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      No payout requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      {/* Process Payout Modal */}
      <Modal show={showProcessModal} onHide={() => setShowProcessModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Process Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayout && (
            <>
              <Alert variant="info">
                <strong>Payout Details:</strong><br />
                <Row className="mt-2">
                  <Col md={6}>
                    <strong>Affiliate:</strong> {selectedPayout.affiliateId?.affiliateCode}<br />
                    <strong>Requested Amount:</strong> ${selectedPayout.amount?.toFixed(2)}<br />
                    <strong>TDS ({selectedPayout.tdsRate || 10}%):</strong> ${selectedPayout.tdsAmount?.toFixed(2)}
                  </Col>
                  <Col md={6}>
                    <strong>Net Amount:</strong> ${selectedPayout.netAmount?.toFixed(2)}<br />
                    <strong>Payment Method:</strong> {selectedPayout.paymentMethod}<br />
                    <strong>Request Date:</strong> {new Date(selectedPayout.createdAt).toLocaleString()}
                  </Col>
                </Row>
              </Alert>
              
              <Alert variant="warning">
                <strong>Payment Details:</strong><br />
                {selectedPayout.paymentMethod === 'PayPal' && (
                  <>PayPal Email: <code>{selectedPayout.paymentDetails?.paypalEmail}</code></>
                )}
                {selectedPayout.paymentMethod === 'Bank Transfer' && (
                  <>
                    Account Holder: {selectedPayout.paymentDetails?.bankDetails?.accountHolderName}<br />
                    Account Number: {selectedPayout.paymentDetails?.bankDetails?.accountNumber}<br />
                    Bank Name: {selectedPayout.paymentDetails?.bankDetails?.bankName}<br />
                    IFSC Code: {selectedPayout.paymentDetails?.bankDetails?.ifscCode}
                  </>
                )}
                {selectedPayout.paymentMethod === 'UPI' && (
                  <>UPI ID: <code>{selectedPayout.paymentDetails?.upiId}</code></>
                )}
              </Alert>
              
              <Alert variant="danger">
                <strong>⚠️ Confirm Action:</strong> This will transfer ${selectedPayout.netAmount?.toFixed(2)} to the affiliate's account.
                Please verify all details before proceeding.
              </Alert>
              
              <Form.Group className="mt-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add any notes about this payout..."
                />
              </Form.Group>
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
            {processing ? 'Processing...' : 'Confirm & Process Payout'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Payout Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payout Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayout && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Payout ID:</strong>
                  <p><code>{selectedPayout._id}</code></p>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <p>{getStatusBadge(selectedPayout.status)}</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Affiliate Code:</strong>
                  <p>{selectedPayout.affiliateId?.affiliateCode}</p>
                </Col>
                <Col md={6}>
                  <strong>Affiliate Email:</strong>
                  <p>{selectedPayout.affiliateId?.paymentEmail}</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Requested Amount:</strong>
                  <p className="h5 text-primary">${selectedPayout.amount?.toFixed(2)}</p>
                </Col>
                <Col md={6}>
                  <strong>Net Amount:</strong>
                  <p className="h5 text-success">${selectedPayout.netAmount?.toFixed(2)}</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>TDS Amount:</strong>
                  <p>${selectedPayout.tdsAmount?.toFixed(2)}</p>
                </Col>
                <Col md={6}>
                  <strong>TDS Rate:</strong>
                  <p>{selectedPayout.tdsRate || 10}%</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Payment Method:</strong>
                  <p>{selectedPayout.paymentMethod}</p>
                </Col>
                <Col md={6}>
                  <strong>Transaction ID:</strong>
                  <p>{selectedPayout.transactionId || 'Not processed yet'}</p>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Request Date:</strong>
                  <p>{new Date(selectedPayout.createdAt).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <strong>Processed Date:</strong>
                  <p>{selectedPayout.processedAt ? new Date(selectedPayout.processedAt).toLocaleString() : 'Not processed'}</p>
                </Col>
              </Row>
              
              {selectedPayout.failureReason && (
                <Alert variant="danger">
                  <strong>Failure Reason:</strong><br />
                  {selectedPayout.failureReason}
                </Alert>
              )}
              
              {selectedPayout.notes && (
                <Alert variant="info">
                  <strong>Notes:</strong><br />
                  {selectedPayout.notes}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payouts;