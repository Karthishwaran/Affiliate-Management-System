import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaChartLine, FaCalendar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Loading from '../Common/Loading';
import { validateDate } from '../../utils/validators';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const generateReport = async () => {
    if (!validateDate(dateRange.startDate) || !validateDate(dateRange.endDate)) {
      toast.error('Invalid date range');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get('/reports/affiliate', {
        params: dateRange
      });
      setReportData(response.data.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.get('/reports/affiliate', {
        params: { ...dateRange, format: 'csv' },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `affiliate-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  if (loading) return <Loading />;

  const chartData = reportData?.breakdown?.map(day => ({
    date: day.date,
    clicks: day.clicks,
    conversions: day.conversions,
    revenue: day.revenue
  })) || [];

  return (
    <Container fluid>
      <h2 className="mb-4">Performance Reports</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaCalendar />
                  </span>
                  <Form.Control
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaCalendar />
                  </span>
                  <Form.Control
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={generateReport}>
                  <FaChartLine className="me-2" /> Generate Report
                </Button>
                {reportData && (
                  <Button variant="outline-secondary" onClick={exportCSV}>
                    <FaDownload className="me-2" /> Export CSV
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {reportData && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Clicks</h6>
                  <h3>{reportData.summary.totalClicks.toLocaleString()}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Conversions</h6>
                  <h3>{reportData.summary.totalConversions.toLocaleString()}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Revenue</h6>
                  <h3>${reportData.summary.totalRevenue.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Commission</h6>
                  <h3>${reportData.summary.totalCommission.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Performance Chart</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#4e73df" name="Clicks" />
                    <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#1cc88a" name="Conversions" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f6c23e" name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Daily Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clicks</th>
                    <th>Unique Clicks</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                    <th>Commission</th>
                    <th>Conversion Rate</th>
                  </tr>
                  </thead>
                <tbody>
                  {reportData.breakdown.map(day => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.clicks.toLocaleString()}</td>
                      <td>{day.uniqueClicks?.toLocaleString() || 0}</td>
                      <td>{day.conversions.toLocaleString()}</td>
                      <td>${day.revenue?.toFixed(2) || 0}</td>
                      <td>${day.commission?.toFixed(2) || 0}</td>
                      <td>{day.conversionRate?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Reports;