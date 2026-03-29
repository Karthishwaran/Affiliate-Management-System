import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaLink,
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaPaintBrush,
  FaCog,
  FaWallet,
  FaFileAlt
} from 'react-icons/fa';

const Sidebar = ({ isAdmin }) => {
  const affiliateLinks = [
    { to: '/affiliate', icon: FaTachometerAlt, label: 'Dashboard' },
    { to: '/affiliate/links', icon: FaLink, label: 'My Links' },
    { to: '/affiliate/earnings', icon: FaDollarSign, label: 'Earnings' },
    { to: '/affiliate/creatives', icon: FaPaintBrush, label: 'Creatives' },
    { to: '/affiliate/reports', icon: FaChartLine, label: 'Reports' },
    { to: '/affiliate/profile', icon: FaCog, label: 'Profile' }
  ];

  const adminLinks = [
    { to: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { to: '/admin/affiliates', icon: FaUsers, label: 'Affiliates' },
    { to: '/admin/payouts', icon: FaWallet, label: 'Payouts' },
    { to: '/admin/commissions', icon: FaDollarSign, label: 'Commissions' },
    { to: '/admin/reports', icon: FaFileAlt, label: 'Reports' },
    { to: '/admin/settings', icon: FaCog, label: 'Settings' }
  ];

  const links = isAdmin ? adminLinks : affiliateLinks;

  return (
    <div className="sidebar d-flex flex-column vh-100 sticky-top" style={{ width: '250px' }}>
      <div className="text-center py-4">
        <h4 className="text-white mb-0">Affiliate</h4>
        <small className="text-white-50">Management System</small>
      </div>
      
      <Nav className="flex-column px-3">
        {links.map((link) => (
          <Nav.Link
            key={link.to}
            as={NavLink}
            to={link.to}
            className="mb-2"
            activeClassName="active"
          >
            <link.icon className="me-2" />
            {link.label}
          </Nav.Link>
        ))}
      </Nav>
      
      <div className="mt-auto p-3">
        <div className="bg-white bg-opacity-10 rounded p-3 text-center">
          <small className="text-white-50">Need Help?</small>
          <br />
          <a href="/support" className="text-white text-decoration-none small">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;