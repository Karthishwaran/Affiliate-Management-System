const geoip = require('geoip-lite');

// Detect fraudulent activity
exports.detectFraud = async (data) => {
  const { amount, clickFraudScore, ip, userAgent } = data;
  
  let fraudScore = 0;
  let fraudReasons = [];

  // Check click fraud score
  if (clickFraudScore > 50) {
    fraudScore += clickFraudScore * 0.5;
    fraudReasons.push('High click fraud score');
  }

  // Check for suspicious amount
  if (amount > 10000) {
    fraudScore += 20;
    fraudReasons.push('Unusually high amount');
  }

  // Check IP reputation (simplified)
  const ipInfo = geoip.lookup(ip);
  if (ipInfo && ipInfo.country === 'Proxy') {
    fraudScore += 30;
    fraudReasons.push('Proxy/VPN detected');
  }

  // Check for multiple conversions from same IP
  if (await checkIPConversionFrequency(ip)) {
    fraudScore += 25;
    fraudReasons.push('Multiple conversions from same IP');
  }

  // Check user agent consistency
  if (await checkUserAgentFraud(userAgent)) {
    fraudScore += 20;
    fraudReasons.push('Suspicious user agent');
  }

  return Math.min(fraudScore, 100);
};

// Calculate fraud score for click
exports.calculateFraudScore = (data) => {
  const { ip, userAgent, isBot, isDuplicate, referrer, geoData } = data;
  
  let score = 0;

  if (isBot) score += 50;
  if (isDuplicate) score += 30;
  if (!referrer || referrer === 'direct') score += 10;
  
  // Check geo location
  if (geoData && geoData.country === 'Unknown') score += 15;
  
  // Check for suspicious user agents
  const suspiciousAgents = ['curl', 'wget', 'python', 'java', 'scrapy'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    score += 40;
  }

  return Math.min(score, 100);
};

// Helper functions
async function checkIPConversionFrequency(ip) {
  // In production, check database for recent conversions from same IP
  // For now, return false
  return false;
}

async function checkUserAgentFraud(userAgent) {
  const suspicious = ['headless', 'phantom', 'selenium'];
  return suspicious.some(s => userAgent.toLowerCase().includes(s));
}