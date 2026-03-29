import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

const Alert = ({ type, message, onClose, dismissible = true }) => {
  if (!message) return null;
  
  const variant = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info'
  }[type] || 'info';
  
  return (
    <BootstrapAlert
      variant={variant}
      onClose={onClose}
      dismissible={dismissible}
      className="mb-3"
    >
      {message}
    </BootstrapAlert>
  );
};

export default Alert;