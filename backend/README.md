# Affiliate Management System - Backend API

## Features

- ✅ Affiliate Recruitment & KYC
- ✅ Link Management with Tracking
- ✅ Commission Calculation
- ✅ Payout Processing
- ✅ Real-time Analytics
- ✅ Fraud Detection
- ✅ Marketing Tools (Creatives, Coupons)
- ✅ JWT Authentication
- ✅ OAuth (Google Login)
- ✅ Email Notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Affiliate
- `GET /api/affiliate/dashboard/stats` - Dashboard statistics
- `GET /api/affiliate/profile` - Get profile
- `PUT /api/affiliate/profile` - Update profile
- `POST /api/affiliate/kyc/upload` - Upload KYC documents
- `GET /api/affiliate/performance/metrics` - Performance metrics

### Links
- `POST /api/links/create` - Create tracking link
- `GET /api/links` - Get all links
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/links/:id/stats` - Link statistics

### Tracking
- `GET /track/click/:code` - Track clicks (public)
- `POST /api/tracking/conversion` - Register conversion

### Commissions
- `GET /api/commissions` - Get commissions
- `GET /api/commissions/summary` - Commission summary

### Payouts
- `POST /api/payouts/request` - Request payout
- `GET /api/payouts` - Payout history

### Admin
- `GET /api/admin/affiliates` - List affiliates
- `PUT /api/admin/affiliates/:id/approve` - Approve affiliate
- `PUT /api/admin/affiliates/:id/reject` - Reject affiliate
- `GET /api/admin/affiliates/:id` - Affiliate details
- `GET /api/admin/payouts` - All payouts
- `POST /api/admin/payouts/:id/process` - Process payout

## Installation

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update values
4. Start MongoDB
5. Run seed: `npm run seed`
6. Start server: `npm run dev`

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/affiliate_system
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
PAYPAL_CLIENT_ID=your-paypal-client-id
STRIPE_SECRET_KEY=your-stripe-key