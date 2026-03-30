# Affiliate-Management-System
# Affiliate Management System

A complete affiliate marketing platform to recruit affiliates, track referrals, manage commissions, and process payouts.
DEMO VIDEO:
Link : https://drive.google.com/file/d/1pMtk3-QYeOqbZ6M64euAcUjs3Sg5kPUt/view?usp=sharing

## 🚀 Features

### 1. Affiliate Recruitment
- Self-registration portal with approval workflow
- KYC document upload
- Affiliate profile management
- Real-time dashboard with stats and earnings

### 2. Tracking & Attribution
- Unique affiliate links with Sub-ID tracking
- Configurable cookie duration (1-365 days)
- Multi-touch attribution
- Real-time conversion tracking
- Fraud detection system

### 3. Commission Management
- Multiple commission types (Flat rate, Percentage, Hybrid)
- Product-wise commission
- Volume-based slabs
- Performance bonuses
- Auto-calculation with status tracking

### 4. Payout Management
- Multiple payment methods (PayPal, Bank Transfer, UPI)
- Minimum payout threshold
- Bulk payment processing
- Tax deduction management (TDS)

### 5. Reporting & Analytics
- Click statistics and conversion rates
- Earnings reports
- Affiliate performance ranking
- ROI analysis
- Fraud alerts

### 6. Marketing Tools
- Creatives library (banners, text links)
- Coupon code generator
- Promotional materials

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Nodemailer for emails
- Cloudinary for file uploads
- Winston for logging

### Frontend
- React 18
- Bootstrap 5
- React Router DOM
- Axios
- React Query
- Chart.js & Recharts
- React Toastify

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/affiliate-management-system.git
cd affiliate-management-system

Backend Setup

cd backend
cp .env.example .env
npm install
npm run dev

Frontend Setup
cd frontend
cp .env.example .env
npm install
npm start

ER DIAGRAM
+----------------+     +----------------+     +----------------+
|     Users      |     |   Affiliates   |     |     Links      |
+----------------+     +----------------+     +----------------+
| id (PK)        |<--- | userId (FK)    |     | id (PK)        |
| email          |     | id (PK)        |---->| affiliateId(FK)|
| password       |     | affiliateCode  |     | name           |
| name           |     | website        |     | code           |
| phone          |     | paymentEmail   |     | targetUrl      |
| role           |     | status         |     | clicks         |
| isActive       |     | totalEarnings  |     | conversions    |
+----------------+     | pendingComm    |     | revenue        |
                       +----------------+     +----------------+
                              |                         |
                              |                         |
                              v                         v
                       +----------------+     +----------------+
                       |   Payouts      |     |    Clicks      |
                       +----------------+     +----------------+
                       | id (PK)        |     | id (PK)        |
                       | affiliateId(FK)|<--- | affiliateId(FK)|
                       | amount         |     | linkId (FK)    |
                       | netAmount      |     | clickId        |
                       | paymentMethod  |     | ip             |
                       | status         |     | device         |
                       | transactionId  |     | country        |
                       +----------------+     | subId          |
                                              | converted      |
                                              +----------------+
                                                     |
                                                     |
                                                     v
                                              +----------------+
                                              |  Conversions   |
                                              +----------------+
                                              | id (PK)        |
                                              | clickId (FK)   |
                                              | affiliateId(FK)|
                                              | orderId        |
                                              | amount         |
                                              | commission     |
                                              | status         |
                                              +----------------+
                                                     |
                                                     |
                                                     v
                                              +----------------+
                                              |  Commissions   |
                                              +----------------+
                                              | id (PK)        |
                                              | affiliateId(FK)|
                                              | conversionId(FK)
                                              | amount         |
                                              | status         |
                                              | paymentId (FK) |
API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
POST	/api/auth/refresh-token	Refresh JWT token
Affiliate
Method	Endpoint	Description
GET	/api/affiliate/dashboard/stats	Get dashboard stats
GET	/api/affiliate/profile	Get affiliate profile
PUT	/api/affiliate/profile	Update profile
POST	/api/affiliate/kyc/upload	Upload KYC document
Links
Method	Endpoint	Description
POST	/api/links/create	Create tracking link
GET	/api/links	Get all links
GET	/api/links/:id/stats	Get link statistics
Tracking
Method	Endpoint	Description
GET	/track/click/:code	Track click
POST	/api/tracking/conversion	Register conversion
Commissions
Method	Endpoint	Description
GET	/api/commissions	Get commissions
GET	/api/commissions/summary	Get commission summary
Payouts
Method	Endpoint	Description
POST	/api/payouts/request	Request payout
GET	/api/payouts	Get payout history
Admin
Method	Endpoint	Description
GET	/api/admin/affiliates	Get all affiliates
PUT	/api/admin/affiliates/:id/approve	Approve affiliate
GET	/api/admin/payouts	Get all payouts
POST	/api/admin/payouts/:id/process	Process payout
                                              +----------------+
