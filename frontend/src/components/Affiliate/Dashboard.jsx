import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaDollarSign, FaMousePointer, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token"); // ✅ get token

    const [statsRes, performanceRes] = await Promise.all([
      axios.get('http://localhost:5000/api/affiliate/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}` // ✅ send token
        }
      }),
      axios.get('http://localhost:5000/api/affiliate/performance/metrics', {
        headers: {
          Authorization: `Bearer ${token}` // ✅ send token
        },
        params: {
          startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      })
    ]);

    setStats(statsRes.data.data);
    setPerformanceData(performanceRes.data.data);

  } catch (error) {
    toast.error('Failed to fetch dashboard data');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const lineChartData = {
    labels: performanceData?.dailyPerformance?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Clicks',
        data: performanceData?.dailyPerformance?.map(d => d.clicks) || [],
        borderColor: 'rgb(78, 115, 223)',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Conversions',
        data: performanceData?.conversionData?.map(d => d.conversions) || [],
        borderColor: 'rgb(28, 200, 138)',
        backgroundColor: 'rgba(28, 200, 138, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const doughnutData = {
    labels: ['Pending', 'Approved', 'Paid'],
    datasets: [
      {
        data: [
          stats?.overview?.pendingCommission || 0,
          stats?.overview?.totalEarnings - stats?.overview?.pendingCommission || 0,
          stats?.overview?.totalEarnings - stats?.overview?.pendingCommission || 0
        ],
        backgroundColor: ['#f6c23e', '#4e73df', '#1cc88a'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome back, {user?.name}!</h2>
        <Badge bg="info" className="p-2">
          Performance Score: {stats?.performanceScore || 0}
        </Badge>
      </div>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-primary h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Earnings</h6>
                  <h3 className="mb-0">${stats?.overview?.totalEarnings?.toFixed(2) || 0}</h3>
                  <small className="text-success">
                    +{((stats?.overview?.totalEarnings / 1000) || 0).toFixed(1)}% from last month
                  </small>
                </div>
                <FaDollarSign size={48} className="text-primary opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-info h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Clicks</h6>
                  <h3 className="mb-0">{stats?.overview?.totalClicks?.toLocaleString() || 0}</h3>
                  <small className="text-muted">Unique: {stats?.overview?.uniqueClicks || 0}</small>
                </div>
                <FaMousePointer size={48} className="text-info opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-success h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Conversions</h6>
                  <h3 className="mb-0">{stats?.overview?.totalConversions?.toLocaleString() || 0}</h3>
                  <small className="text-muted">Conversion Rate: {stats?.overview?.conversionRate || 0}%</small>
                </div>
                <FaShoppingCart size={48} className="text-success opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card stat-card-warning h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pending Commission</h6>
                  <h3 className="mb-0">${stats?.overview?.pendingCommission?.toFixed(2) || 0}</h3>
                  <small className="text-muted">Awaiting approval</small>
                </div>
                <FaChartLine size={48} className="text-warning opacity-25" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Performance Overview</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">Commission Breakdown</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <div style={{ height: '250px' }}>
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Pending:</span>
                  <strong>${stats?.overview?.pendingCommission?.toFixed(2) || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Approved:</span>
                  <strong>${((stats?.overview?.totalEarnings || 0) - (stats?.overview?.pendingCommission || 0)).toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Paid:</span>
                  <strong>${((stats?.overview?.totalEarnings || 0) - (stats?.overview?.pendingCommission || 0)).toFixed(2)}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Conversions */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Recent Conversions</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentConversions?.map(conversion => (
                    <tr key={conversion._id}>
                      <td><code>{conversion.orderId}</code></td>
                      <td>${conversion.amount?.toFixed(2)}</td>
                      <td>${conversion.commission?.toFixed(2)}</td>
                      <td>
                        <Badge bg={conversion.status === 'approved' ? 'success' : 'warning'}>
                          {conversion.status}
                        </Badge>
                      </td>
                      <td>{new Date(conversion.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!stats?.recentConversions || stats.recentConversions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No conversions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;