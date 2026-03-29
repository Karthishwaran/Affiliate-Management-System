import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';

const CommissionSettings = () => {
  const [settings, setSettings] = useState({
    defaultCommissionType: 'percentage',
    defaultCommissionRate: 10,
    minPayoutAmount: 50,
    tdsRate: 10,
    autoApproveCommission: false,
    tier2Enabled: false,
    tier2Rate: 5,
    performanceBonusEnabled: true,
    bonusThresholds: [
      { earnings: 1000, bonus: 5 },
      { earnings: 5000, bonus: 10 },
      { earnings: 10000, bonus: 15 }
    ]
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBonusChange = (index, field, value) => {
    const newBonuses = [...settings.bonusThresholds];
    newBonuses[index][field] = parseFloat(value);
    setSettings({ ...settings, bonusThresholds: newBonuses });
  };

  const addBonusThreshold = () => {
    setSettings({
      ...settings,
      bonusThresholds: [...settings.bonusThresholds, { earnings: 0, bonus: 0 }]
    });
  };

  const removeBonusThreshold = (index) => {
    const newBonuses = settings.bonusThresholds.filter((_, i) => i !== index);
    setSettings({ ...settings, bonusThresholds: newBonuses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Commission settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Commission Settings</h2>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={6}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Default Commission Structure</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Commission Type</Form.Label>
                  <Form.Select
                    name="defaultCommissionType"
                    value={settings.defaultCommissionType}
                    onChange={handleChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Rate ($)</option>
                    <option value="hybrid">Hybrid (Flat + %)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Commission Rate</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="number"
                      name="defaultCommissionRate"
                      value={settings.defaultCommissionRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <span className="input-group-text">
                      {settings.defaultCommissionType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Auto-approve commissions"
                    name="autoApproveCommission"
                    checked={settings.autoApproveCommission}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Automatically approve commissions without manual review
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Payout Settings</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Payout Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPayoutAmount"
                    value={settings.minPayoutAmount}
                    onChange={handleChange}
                    min="10"
                    step="10"
                  />
                  <Form.Text className="text-muted">
                    Affiliates must reach this amount before requesting payout
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>TDS Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="tdsRate"
                    value={settings.tdsRate}
                    onChange={handleChange}
                    min="0"
                    max="30"
                    step="0.5"
                  />
                  <Form.Text className="text-muted">
                    Tax Deducted at Source percentage
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Tier 2 Commission</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Tier 2 Commissions"
                    name="tier2Enabled"
                    checked={settings.tier2Enabled}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                {settings.tier2Enabled && (
                  <Form.Group className="mb-3">
                    <Form.Label>Tier 2 Commission Rate (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="tier2Rate"
                      value={settings.tier2Rate}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      step="0.5"
                    />
                    <Form.Text className="text-muted">
                      Commission for referring other affiliates
                    </Form.Text>
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Performance Bonuses</h5>
                  <Button variant="outline-primary" size="sm" onClick={addBonusThreshold}>
                    Add Threshold
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Performance Bonuses"
                    name="performanceBonusEnabled"
                    checked={settings.performanceBonusEnabled}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                {settings.performanceBonusEnabled && (
                  <>
                    <Alert variant="info" className="mt-3">
                      Affiliates earn additional bonus percentage when reaching earnings milestones
                    </Alert>
                    
                    {settings.bonusThresholds.map((threshold, index) => (
                      <Row key={index} className="mb-2 align-items-center">
                        <Col>
                          <Form.Control
                            type="number"
                            placeholder="Earnings ($)"
                            value={threshold.earnings}
                            onChange={(e) => handleBonusChange(index, 'earnings', e.target.value)}
                          />
                        </Col>
                        <Col>
                          <div className="input-group">
                            <Form.Control
                              type="number"
                              placeholder="Bonus (%)"
                              value={threshold.bonus}
                              onChange={(e) => handleBonusChange(index, 'bonus', e.target.value)}
                            />
                            <span className="input-group-text">%</span>
                          </div>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeBonusThreshold(index)}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <div className="mt-4 text-end">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            <FaSave className="me-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CommissionSettings;