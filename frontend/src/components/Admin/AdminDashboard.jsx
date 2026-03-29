import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUsers, FaDollarSign, FaShoppingCart, FaMousePointer } from 'react-icons/fa';
import Loading from '../Common/Loading';
import Chart from '../Common/Chart';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPayouts, setRecentPayouts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, payoutsRes] = await Promise.all([
        axios.get('/admin/dashboard/stats'),
        axios.get('/admin/payouts', { params: { limit: 5 } })
      ]);
      setStats(statsRes.data.data);
      setRecentPayouts(payoutsRes.data.data.payouts);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const chartData = {
    labels: stats?.monthlyTrends?.map(t => t._id) || [],
    datasets: [
      {
        label: 'Conversions',
        data: stats?.monthlyTrends?.map(t => t.conversions) || [],
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        fill: true
      },
      {
        label: 'Revenue',
        data: stats?.monthlyTrends?.map(t => t.revenue) || [],
        borderColor: '#1cc88a',
        backgroundColor: 'rgba(28, 200, 138, 0.1)',
        fill: true
      }
    ]
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-primary h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Affiliates</h6>
                  <h3>{stats?.overview?.totalAffiliates || 0}</h3>
                  <small className="text-muted">
                    Pending: {stats?.overview?.pendingAffiliates || 0}
                  </small>
                </div>
                <FaUsers size={48} className="text-primary opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-success h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Revenue</h6>
                  <h3>${stats?.overview?.totalCommission?.toFixed(2) || 0}</h3>
                  <small className="text-muted">
                    Paid: ${stats?.overview?.totalPaid?.toFixed(2) || 0}
                  </small>
                </div>
                <FaDollarSign size={48} className="text-success opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-info h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Conversions</h6>
                  <h3>{stats?.overview?.totalConversions?.toLocaleString() || 0}</h3>
                  <small className="text-muted">
                    Conversion Rate: {stats?.overview?.conversionRate?.toFixed(2)}%
                  </small>
                </div>
                <FaShoppingCart size={48} className="text-info opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-warning h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Clicks</h6>
                  <h3>{stats?.overview?.totalClicks?.toLocaleString() || 0}</h3>
                  <small className="text-muted">
                    Last 30 days
                  </small>
                </div>
                <FaMousePointer size={48} className="text-warning opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Chart */}
      <Row className="mb-4">
        <Col lg={8}>
          <Chart
            type="line"
            data={chartData}
            title="Performance Trends"
            height={400}
          />
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">Top Affiliates</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.topAffiliates?.map(aff => (
                    <tr key={aff._id}>
                      <td>{aff.userId?.name}</td>
                      <td>${aff.totalEarnings?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Payout Requests */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Payout Requests</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map(payout => (
                <tr key={payout._id}>
                  <td>{payout.affiliateId?.affiliateCode}</td>
                  <td>${payout.amount?.toFixed(2)}</td>
                  <td>{payout.paymentMethod}</td>
                  <td>
                    <Badge bg={payout.status === 'pending' ? 'warning' : 'success'}>
                      {payout.status}
                    </Badge>
                  </td>
                  <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;