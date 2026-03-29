import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaCode, FaDownload, FaImage } from 'react-icons/fa';
import Loading from '../Common/Loading';

const Creatives = () => {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [creativeCode, setCreativeCode] = useState('');

  useEffect(() => {
    fetchCreatives();
  }, []);

  const fetchCreatives = async () => {
    try {
      const response = await axios.get('/creatives');
      setCreatives(response.data.data.creatives);
    } catch (error) {
      toast.error('Failed to fetch creatives');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (id) => {
    try {
      const response = await axios.get(`/creatives/${id}/code`);
      setCreativeCode(response.data.data.code);
      setShowCodeModal(true);
    } catch (error) {
      toast.error('Failed to get creative code');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(creativeCode);
    toast.success('Code copied to clipboard!');
  };

  if (loading) return <Loading />;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Marketing Creatives</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Upload Creative
        </Button>
      </div>
      
      <Row>
        {creatives.map(creative => (
          <Col lg={4} md={6} className="mb-4" key={creative._id}>
            <Card className="h-100 shadow-sm">
              {creative.imageUrl && (
                <Card.Img
                  variant="top"
                  src={creative.imageUrl}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{creative.name}</h5>
                  <Badge bg="primary">{creative.type}</Badge>
                </div>
                <p className="text-muted small">
                  {creative.dimensions?.width}x{creative.dimensions?.height}
                </p>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleCopyCode(creative._id)}
                  >
                    <FaCode className="me-1" /> Get Code
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => window.open(creative.previewUrl, '_blank')}
                  >
                    <FaImage className="me-1" /> Preview
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        
        {creatives.length === 0 && (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <FaImage size={48} className="text-muted mb-3" />
                <h5>No Creatives Available</h5>
                <p className="text-muted">
                  Upload banners, text links, and other marketing materials
                </p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Upload Your First Creative
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      
      {/* Code Modal */}
      <Modal show={showCodeModal} onHide={() => setShowCodeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Creative Embed Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Copy and paste this code into your website</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              value={creativeCode}
              readOnly
              className="font-monospace"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCodeModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={copyToClipboard}>
            <FaDownload className="me-2" /> Copy Code
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Creatives;