import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaCopy, FaTrash, FaEdit, FaChartLine } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    campaignId: '',
    cookieDuration: 30
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get('/links');
      setLinks(response.data.data.links);
    } catch (error) {
      toast.error('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/links/create', formData);
      toast.success('Link created successfully!');
      setShowModal(false);
      setFormData({ name: '', targetUrl: '', campaignId: '', cookieDuration: 30 });
      fetchLinks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create link');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await axios.delete(`/links/${id}`);
        toast.success('Link deleted successfully');
        fetchLinks();
      } catch (error) {
        toast.error('Failed to delete link');
      }
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <Loading />;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Affiliate Links</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Create New Link
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Tracking Link</th>
                <th>Clicks</th>
                <th>Conversions</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link._id}>
                  <td>
                    <strong>{link.name}</strong>
                    {link.campaignId && (
                      <div><small className="text-muted">Campaign: {link.campaignId}</small></div>
                    )}
                  </td>
                  <td>
                    <code className="small">{link.trackingUrl?.substring(0, 50)}...</code>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => copyToClipboard(link.trackingUrl)}
                      className="p-0 ms-2"
                    >
                      <FaCopy />
                    </Button>
                  </td>
                  <td>{link.clicks?.toLocaleString()}</td>
                  <td>{link.conversions?.toLocaleString()}</td>
                  <td>${link.revenue?.toFixed(2) || 0}</td>
                  <td>
                    <Badge bg={link.status === 'active' ? 'success' : 'secondary'}>
                      {link.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-info me-2"
                      onClick={() => {/* View stats */}}
                    >
                      <FaChartLine />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-warning me-2"
                      onClick={() => setEditingLink(link)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      onClick={() => handleDeleteLink(link._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No links created yet. Click "Create New Link" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Affiliate Link</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateLink}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Link Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Summer Sale Campaign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Target URL *</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/product"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Where users will be redirected after clicking your affiliate link
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Campaign ID (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., summer2024"
                value={formData.campaignId}
                onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Cookie Duration (Days)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="365"
                value={formData.cookieDuration}
                onChange={(e) => setFormData({ ...formData, cookieDuration: parseInt(e.target.value) })}
              />
              <Form.Text className="text-muted">
                How long the tracking cookie will last (default: 30 days)
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Link
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Links;