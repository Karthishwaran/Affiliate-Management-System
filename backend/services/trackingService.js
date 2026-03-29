const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Link = require('../models/Link');
const { v4: uuidv4 } = require('uuid');
const { detectFraud, calculateFraudScore } = require('./fraudDetection');

class TrackingService {
  // Track a new click
  static async trackClick(linkCode, reqData) {
    try {
      const { ip, userAgent, referrer, queryParams } = reqData;
      
      const link = await Link.findOne({ code: linkCode, status: 'active' });
      if (!link) {
        return { success: false, error: 'Invalid link' };
      }

      // Check link expiry
      if (link.expiryDate && new Date() > link.expiryDate) {
        link.status = 'expired';
        await link.save();
        return { success: false, error: 'Link expired' };
      }

      // Check for duplicate clicks
      const recentClick = await Click.findOne({
        linkId: link._id,
        ip,
        createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
      });

      const isBot = /bot|crawl|spider|scraper/i.test(userAgent);
      const isUnique = !recentClick && !isBot;

      // Calculate fraud score
      const fraudData = { ip, userAgent, isBot, isDuplicate: !!recentClick, referrer };
      const fraudScore = calculateFraudScore(fraudData);

      // Create click record
      const click = await Click.create({
        affiliateId: link.affiliateId,
        linkId: link._id,
        clickId: uuidv4(),
        ip,
        userAgent,
        referrer,
        subId: queryParams.subId,
        isUnique,
        isBot,
        fraudScore,
        expiresAt: new Date(Date.now() + link.cookieDuration * 24 * 60 * 60 * 1000)
      });

      // Update link stats
      await Link.findByIdAndUpdate(link._id, {
        $inc: { clicks: 1, uniqueClicks: isUnique ? 1 : 0 }
      });

      return {
        success: true,
        data: {
          clickId: click.clickId,
          targetUrl: link.targetUrl,
          cookieDuration: link.cookieDuration,
          fraudScore: click.fraudScore
        }
      };
    } catch (error) {
      console.error('Track click error:', error);
      return { success: false, error: error.message };
    }
  }

  // Register a conversion
  static async registerConversion(clickId, conversionData) {
    try {
      const { orderId, amount, conversionType, productId, customData } = conversionData;
      
      // Find the click
      const click = await Click.findOne({ clickId });
      if (!click) {
        return { success: false, error: 'Click not found' };
      }

      // Check if already converted
      if (click.converted) {
        return { success: false, error: 'Already converted' };
      }

      // Check for duplicate order
      const existingConversion = await Conversion.findOne({ orderId });
      if (existingConversion) {
        return { success: false, error: 'Order already registered' };
      }

      // Fraud detection for conversion
      const fraudScore = await detectFraud({
        amount,
        clickFraudScore: click.fraudScore,
        ip: click.ip,
        userAgent: click.userAgent
      });

      // Create conversion
      const conversion = await Conversion.create({
        clickId: click._id,
        affiliateId: click.affiliateId,
        linkId: click.linkId,
        orderId,
        amount,
        conversionType,
        productId,
        customData,
        ip: click.ip,
        userAgent: click.userAgent,
        device: click.device,
        browser: click.browser,
        os: click.os,
        country: click.country,
        city: click.city,
        subId: click.subId,
        fraudScore,
        status: fraudScore > 70 ? 'fraud' : 'pending'
      });

      // Update click
      click.converted = true;
      click.conversionId = conversion._id;
      await click.save();

      // Update link stats
      await Link.findByIdAndUpdate(click.linkId, {
        $inc: { conversions: 1, revenue: amount }
      });

      return {
        success: true,
        data: conversion,
        isFraud: conversion.status === 'fraud'
      };
    } catch (error) {
      console.error('Register conversion error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get click statistics
  static async getClickStats(clickId) {
    try {
      const click = await Click.findOne({ clickId })
        .populate('linkId', 'name targetUrl')
        .populate('affiliateId', 'affiliateCode');

      if (!click) {
        return { success: false, error: 'Click not found' };
      }

      const conversion = click.converted ? 
        await Conversion.findOne({ clickId: click._id }) : null;

      return {
        success: true,
        data: {
          click: {
            id: click.clickId,
            timestamp: click.createdAt,
            ip: click.ip,
            device: click.device,
            browser: click.browser,
            country: click.country,
            isUnique: click.isUnique,
            fraudScore: click.fraudScore
          },
          link: click.linkId,
          affiliate: click.affiliateId,
          conversion: conversion ? {
            orderId: conversion.orderId,
            amount: conversion.amount,
            commission: conversion.commission,
            status: conversion.status,
            timestamp: conversion.createdAt
          } : null
        }
      };
    } catch (error) {
      console.error('Get click stats error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get conversion attribution
  static async getAttribution(orderId) {
    try {
      const conversion = await Conversion.findOne({ orderId })
        .populate('clickId')
        .populate('affiliateId', 'affiliateCode userId')
        .populate('linkId', 'name');

      if (!conversion) {
        return { success: false, error: 'Conversion not found' };
      }

      return {
        success: true,
        data: {
          conversion: {
            orderId: conversion.orderId,
            amount: conversion.amount,
            commission: conversion.commission,
            status: conversion.status,
            timestamp: conversion.createdAt
          },
          attribution: {
            affiliate: conversion.affiliateId,
            link: conversion.linkId,
            click: conversion.clickId ? {
              timestamp: conversion.clickId.createdAt,
              device: conversion.clickId.device,
              subId: conversion.clickId.subId
            } : null,
            touchpoint: conversion.clickId?.referrer || 'direct'
          }
        }
      };
    } catch (error) {
      console.error('Get attribution error:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up expired clicks
  static async cleanupExpiredClicks() {
    try {
      const result = await Click.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired clicks`);
      return { success: true, deleted: result.deletedCount };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TrackingService;