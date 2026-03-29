const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Link = require('../models/Link');
const Creative = require('../models/Creative');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Affiliate.deleteMany({});
    await Link.deleteMany({});
    await Creative.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@affiliatesystem.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    
    console.log('Admin user created');
    
    // Create sample affiliate users
    const affiliates = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        name: `Affiliate ${i}`,
        email: `affiliate${i}@example.com`,
        password: await bcrypt.hash('Affiliate@123', 12),
        role: 'affiliate',
        isActive: true
      });
      
      const affiliate = await Affiliate.create({
        userId: user._id,
        affiliateCode: `AFF${1000 + i}`,
        website: `https://affiliate${i}.com`,
        niche: ['Technology', 'Fashion', 'Health', 'Finance', 'Gaming'][i % 5],
        paymentEmail: `payment${i}@example.com`,
        preferredPaymentMethod: ['PayPal', 'Bank Transfer', 'UPI'][i % 3],
        status: i === 1 ? 'pending' : 'approved',
        totalEarnings: Math.random() * 5000,
        pendingCommission: Math.random() * 1000,
        totalClicks: Math.floor(Math.random() * 10000),
        totalConversions: Math.floor(Math.random() * 500),
        conversionRate: Math.random() * 10
      });
      
      affiliates.push(affiliate);
      console.log(`Created affiliate: ${affiliate.affiliateCode}`);
    }
    
    // Create sample links for approved affiliates
    const approvedAffiliates = affiliates.filter(a => a.status === 'approved');
    for (const affiliate of approvedAffiliates) {
      for (let i = 1; i <= 3; i++) {
        await Link.create({
          affiliateId: affiliate._id,
          name: `Campaign ${i}`,
          code: `LINK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          targetUrl: `https://example.com/products/${i}`,
          campaignId: `CAM${i}`,
          cookieDuration: 30,
          status: 'active'
        });
      }
      console.log(`Created links for affiliate: ${affiliate.affiliateCode}`);
    }
    
    // Create sample creatives
    for (const affiliate of approvedAffiliates) {
      await Creative.create({
        affiliateId: affiliate._id,
        name: 'Banner Ad 300x250',
        type: 'banner',
        format: 'image',
        targetUrl: 'https://example.com',
        dimensions: { width: 300, height: 250 },
        tags: ['banner', 'standard'],
        status: 'active'
      });
      
      await Creative.create({
        affiliateId: affiliate._id,
        name: 'Text Link',
        type: 'text_link',
        format: 'text',
        targetUrl: 'https://example.com',
        tags: ['text', 'link'],
        status: 'active'
      });
    }
    
    console.log('Sample creatives created');
    console.log('\n=== Seed Data Complete ===');
    console.log('\nAdmin Login:');
    console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@affiliatesystem.com'}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('\nSample Affiliate Logins:');
    console.log('Email: affiliate1@example.com, Password: Affiliate@123');
    console.log('Email: affiliate2@example.com, Password: Affiliate@123');
    console.log('\nAPI Base URL: http://localhost:5000/api');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();