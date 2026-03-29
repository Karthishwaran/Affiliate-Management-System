const Click = require('../models/Click');
const Link = require('../models/Link');
const Conversion = require('../models/Conversion');
const Affiliate = require('../models/Affiliate');
const { v4: uuidv4 } = require('uuid');
const { detectFraud, calculateFraudScore } = require('../services/fraudDetection');
const { processCommission } = require('../services/commissionService');
const { getGeoLocation } = require('../utils/helpers');

// @desc    Track click (public endpoint)
// @route   GET /track/click/:code
// @access  Public
exports.trackClick = async (req, res) => {
  try {
    const { code } = req.params;
    const { subId, device, ref } = req.query;
    
    const link = await Link.findOne({ code, status: 'active' });
    
    if (!link) {
      return res.redirect(process.env.DEFAULT_REDIRECT_URL || 'https://example.com');
    }

    // Check if link is expired
    if (link.expiryDate && new Date() > link.expiryDate) {
      link.status = 'expired';
      await link.save();
      return res.redirect(process.env.DEFAULT_REDIRECT_URL || 'https://example.com');
    }

    // Get IP and user agent
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = ref || req.headers.referer;

    // Detect bot
    const isBot = /bot|crawl|spider|scraper/i.test(userAgent);

    // Check for duplicate click (within 30 minutes)
    const recentClick = await Click.findOne({
      linkId: link._id,
      ip,
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
    });

    const isUnique = !recentClick && !isBot;

    // Get geo location
    const geoData = await getGeoLocation(ip);

    // Generate unique click ID
    const clickId = uuidv4();

    // Calculate fraud score
    const fraudData = {
      ip,
      userAgent,
      isBot,
      isDuplicate: !!recentClick,
      referrer,
      geoData
    };
    const fraudScore = calculateFraudScore(fraudData);

    // Create click record
    const click = await Click.create({
      affiliateId: link.affiliateId,
      linkId: link._id,
      clickId,
      ip,
      userAgent,
      referrer,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      country: geoData.country,
      city: geoData.city,
      subId: subId || null,
      isUnique,
      isBot,
      fraudScore,
      expiresAt: new Date(Date.now() + link.cookieDuration * 24 * 60 * 60 * 1000)
    });

    // Update link click count
    await Link.findByIdAndUpdate(link._id, {
      $inc: { clicks: 1, uniqueClicks: isUnique ? 1 : 0 }
    });

    // Update affiliate click count
    await Affiliate.findByIdAndUpdate(link.affiliateId, {
      $inc: { totalClicks: 1 }
    });

    // Set cookie for tracking
    res.cookie('affiliate_click_id', clickId, {
      maxAge: link.cookieDuration * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Redirect to target URL
    res.redirect(link.targetUrl);
    
  } catch (error) {
    console.error('Track click error:', error);
    res.redirect(process.env.DEFAULT_REDIRECT_URL || 'https://example.com');
  }
};

// @desc    Register conversion (pixel/API)
// @route   POST /api/tracking/conversion
// @access  Public
exports.registerConversion = async (req, res) => {
  try {
    const {
      clickId,
      orderId,
      amount,
      conversionType = 'sale',
      productId,
      customData
    } = req.body;

    // Get click from cookie or request
    let click = null;
    
    if (clickId) {
      click = await Click.findOne({ clickId });
    } else if (req.cookies.affiliate_click_id) {
      click = await Click.findOne({ clickId: req.cookies.affiliate_click_id });
    }

    if (!click) {
      // Check if conversion already exists
      const existingConversion = await Conversion.findOne({ orderId });
      if (existingConversion) {
        return res.status(400).json({
          success: false,
          message: 'Conversion already registered for this order'
        });
      }

      // Could be from direct link without tracking
      return res.status(404).json({
        success: false,
        message: 'Click not found for conversion'
      });
    }

    // Check if conversion already exists
    const existingConversion = await Conversion.findOne({ orderId });
    if (existingConversion) {
      return res.status(400).json({
        success: false,
        message: 'Conversion already registered'
      });
    }

    // Fraud detection for conversion
    const fraudData = {
      amount,
      clickFraudScore: click.fraudScore,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    const fraudScore = await detectFraud(fraudData);

    // Create conversion record
    const conversion = await Conversion.create({
      clickId: click._id,
      affiliateId: click.affiliateId,
      linkId: click.linkId,
      orderId,
      amount,
      conversionType,
      productId,
      customData,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      device: click.device,
      browser: click.browser,
      os: click.os,
      country: click.country,
      city: click.city,
      subId: click.subId,
      fraudScore,
      status: fraudScore > 70 ? 'fraud' : 'pending'
    });

    // Update click as converted
    click.converted = true;
    click.conversionId = conversion._id;
    await click.save();

    // Update link stats
    await Link.findByIdAndUpdate(click.linkId, {
      $inc: { conversions: 1, revenue: amount }
    });

    // Process commission if not fraudulent
    if (conversion.status !== 'fraud') {
      await processCommission(conversion._id);
    }

    res.json({
      success: true,
      data: conversion,
      message: 'Conversion registered successfully'
    });
    
  } catch (error) {
    console.error('Register conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering conversion'
    });
  }
};

// Helper functions
function detectDevice(userAgent) {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function detectBrowser(userAgent) {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'Other';
}

function detectOS(userAgent) {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Other';
}