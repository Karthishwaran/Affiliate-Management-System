import React, { useState, useCallback } from 'react';
import { Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUpload, FaFilePdf, FaImage } from 'react-icons/fa';

const KYCUpload = () => {
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(file);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentType || !documentNumber || !file) {
      setError('Please fill all fields and select a document');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber);
    formData.append('document', file);
    
    try {
      const response = await axios.post('/affiliate/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      toast.success('KYC document uploaded successfully!');
      setDocumentType('');
      setDocumentNumber('');
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload KYC document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h5 className="mb-3">KYC Verification</h5>
      <p className="text-muted mb-4">
        Please upload a valid government-issued ID for verification. 
        Accepted documents: PAN Card, Aadhar Card, Passport, Driving License.
      </p>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Select document type</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Document Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter document number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Label>Upload Document</Form.Label>
          <div
            {...getRootProps()}
            className={`border rounded p-4 text-center cursor-pointer ${isDragActive ? 'border-primary bg-light' : 'border-dashed'}`}
            style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                {file.type.includes('image') ? (
                  <FaImage size={40} className="text-primary mb-2" />
                ) : (
                  <FaFilePdf size={40} className="text-danger mb-2" />
                )}
                <p className="mb-0">{file.name}</p>
                <small className="text-muted">Click or drag to change file</small>
              </div>
            ) : (
              <div>
                <FaUpload size={40} className="text-muted mb-2" />
                <p>
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag & drop a file here, or click to select'}
                </p>
                <small className="text-muted">
                  Supported: JPG, PNG, PDF (Max 5MB)
                </small>
              </div>
            )}
          </div>
        </Form.Group>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />
        )}
        
        <Button
          type="submit"
          variant="primary"
          disabled={uploading || !file}
          className="w-100"
        >
          {uploading ? 'Uploading...' : 'Upload KYC Document'}
        </Button>
      </Form>
      
      <div className="mt-4">
        <Alert variant="info">
          <strong>Why KYC?</strong><br />
          KYC verification is required to ensure compliance with regulations and to process your payments.
          Your documents are securely stored and only used for verification purposes.
        </Alert>
      </div>
    </div>
  );
};

export default KYCUpload;