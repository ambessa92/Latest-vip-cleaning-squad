const crypto = require('crypto');

// PayPal webhook verification
const verifyPayPalWebhook = (webhookEvent, headers, webhookId) => {
  try {
    const authAlgo = headers['paypal-auth-algo'];
    const transmission_id = headers['paypal-transmission-id'];
    const cert_id = headers['paypal-cert-id'];
    const transmission_time = headers['paypal-transmission-time'];
    const signature = headers['paypal-transmission-sig'];

    // In production, you would verify the webhook signature
    // For now, we'll do basic validation
    return webhookEvent && transmission_id && cert_id && signature;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, PayPal-Auth-Algo, PayPal-Transmission-Id, PayPal-Cert-Id, PayPal-Transmission-Time, PayPal-Transmission-Sig',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const webhookEvent = JSON.parse(event.body);
    const headers = event.headers;

    console.log('PayPal Webhook Event:', {
      event_type: webhookEvent.event_type,
      resource_type: webhookEvent.resource_type,
      summary: webhookEvent.summary
    });

    // Verify webhook (in production, implement proper signature verification)
    const isValid = verifyPayPalWebhook(webhookEvent, headers);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid webhook signature' })
      };
    }

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookEvent);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookEvent);
        break;

      case 'PAYMENT.CAPTURE.PENDING':
        await handlePaymentPending(webhookEvent);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(webhookEvent);
        break;

      default:
        console.log(`Unhandled webhook event type: ${webhookEvent.event_type}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        event_type: webhookEvent.event_type
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

async function handlePaymentCompleted(webhookEvent) {
  const payment = webhookEvent.resource;

  console.log('Payment completed:', {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    custom_id: payment.custom_id
  });

  // Here you could:
  // 1. Update your database with payment confirmation
  // 2. Send additional confirmation emails
  // 3. Trigger fulfillment processes
  // 4. Update customer records

  // Example: Log payment details for tracking
  const paymentData = {
    paypal_payment_id: payment.id,
    amount: payment.amount?.value,
    currency: payment.amount?.currency_code,
    status: payment.status,
    create_time: payment.create_time,
    update_time: payment.update_time,
    custom_id: payment.custom_id,
    payer_email: payment.payer?.email_address,
    payer_name: payment.payer?.name?.given_name + ' ' + payment.payer?.name?.surname
  };

  console.log('Payment data for recording:', paymentData);

  // In a real application, you might save this to a database
  // await savePaymentToDatabase(paymentData);
}

async function handlePaymentDenied(webhookEvent) {
  const payment = webhookEvent.resource;

  console.log('Payment denied:', {
    id: payment.id,
    status: payment.status,
    reason: payment.reason_code
  });

  // Handle denied payment
  // - Send notification to customer
  // - Update order status
  // - Log for review
}

async function handlePaymentPending(webhookEvent) {
  const payment = webhookEvent.resource;

  console.log('Payment pending:', {
    id: payment.id,
    status: payment.status,
    reason: payment.reason_code
  });

  // Handle pending payment
  // - Notify customer of pending status
  // - Set up monitoring for status changes
}

async function handlePaymentRefunded(webhookEvent) {
  const payment = webhookEvent.resource;

  console.log('Payment refunded:', {
    id: payment.id,
    amount: payment.amount,
    status: payment.status
  });

  // Handle refund
  // - Update customer records
  // - Send refund confirmation
  // - Update order status
}
