const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Affiliate Management System',
    html: `
      <h1>Welcome ${data.name}!</h1>
      <p>Thank you for joining our affiliate program. Your affiliate code is: <strong>${data.affiliateCode}</strong></p>
      <p>Start promoting our products and earn commissions today!</p>
      <a href="${process.env.CLIENT_URL}/dashboard">Go to Dashboard</a>
    `
  }),
  
  affiliateApproved: (data) => ({
    subject: 'Affiliate Application Approved',
    html: `
      <h1>Congratulations ${data.name}!</h1>
      <p>Your affiliate application has been approved. You can now start promoting and earning commissions.</p>
      <p>Your affiliate code: <strong>${data.affiliateCode}</strong></p>
      <a href="${data.dashboardUrl}">Access Your Dashboard</a>
    `
  }),
  
  affiliateRejected: (data) => ({
    subject: 'Affiliate Application Update',
    html: `
      <h1>Hello ${data.name},</h1>
      <p>We have reviewed your application and unfortunately cannot approve it at this time.</p>
      <p>Reason: ${data.reason}</p>
      <p>If you have any questions, please contact us at ${data.supportEmail}</p>
    `
  }),
  
  payoutProcessed: (data) => ({
    subject: 'Payout Processed',
    html: `
      <h1>Payout Processed!</h1>
      <p>Your payout of $${data.amount} has been processed via ${data.method}.</p>
      <p>Transaction ID: ${data.transactionId}</p>
      <p>Net amount after TDS: $${data.netAmount}</p>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password. This link expires in ${data.expiresIn}.</p>
      <a href="${data.resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
};

// Send email
exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templateFn = templates[template];
    if (!templateFn) {
      throw new Error(`Template ${template} not found`);
    }

    const emailContent = templateFn(data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};