const paypal = require('paypal-rest-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET
});

// Process payment based on method
exports.processPayment = async ({ method, amount, details, payoutId }) => {
  try {
    switch (method) {
      case 'PayPal':
        return await processPayPalPayment(amount, details, payoutId);
      case 'Bank Transfer':
        return await processBankTransfer(amount, details);
      case 'UPI':
        return await processUPIPayment(amount, details);
      default:
        throw new Error('Invalid payment method');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// PayPal payment
async function processPayPalPayment(amount, details, payoutId) {
  return new Promise((resolve, reject) => {
    const create_payout_json = {
      sender_batch_header: {
        sender_batch_id: payoutId.toString(),
        email_subject: "Affiliate Commission Payout",
        email_message: "You have received a commission payout from Affiliate Management System"
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount.toFixed(2),
            currency: "USD"
          },
          receiver: details.paypalEmail,
          note: "Thank you for your partnership!",
          sender_item_id: `payout_${payoutId}`
        }
      ]
    };

    paypal.payout.create(create_payout_json, function (error, payout) {
      if (error) {
        console.error('PayPal payout error:', error);
        resolve({
          success: false,
          error: error.response?.message || error.message
        });
      } else {
        resolve({
          success: true,
          transactionId: payout.batch_header.payout_batch_id
        });
      }
    });
  });
}

// Bank Transfer (simulated)
async function processBankTransfer(amount, details) {
  // In production, integrate with bank API
  // For now, simulate success
  return {
    success: true,
    transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// UPI Payment (simulated)
async function processUPIPayment(amount, details) {
  // In production, integrate with UPI API (PhonePe, Google Pay, etc.)
  // For now, simulate success
  return {
    success: true,
    transactionId: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// Create Stripe payment intent
exports.createStripePaymentIntent = async (amount, currency = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        integration: 'affiliate_system'
      }
    });
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};