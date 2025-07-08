// Payment Analytics and Monitoring Function
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const now = new Date();
    const analytics = {
      timestamp: now.toISOString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),

      // Payment Monitoring
      payment_metrics: {
        total_attempts: getStoredValue('payment_attempts', 0),
        successful_payments: getStoredValue('successful_payments', 0),
        failed_payments: getStoredValue('failed_payments', 0),
        cancelled_payments: getStoredValue('cancelled_payments', 0),
        total_amount_processed: getStoredValue('total_amount_cad', 0),
        average_payment_amount: calculateAveragePayment(),
        success_rate: calculateSuccessRate(),
        most_recent_payments: getRecentPayments(),
        payment_methods_used: {
          paypal: getStoredValue('paypal_payments', 0)
        }
      },

      // Email Delivery Monitoring
      email_metrics: {
        total_emails_attempted: getStoredValue('email_attempts', 0),
        emails_sent_successfully: getStoredValue('emails_successful', 0),
        emails_failed: getStoredValue('emails_failed', 0),
        email_delivery_rate: calculateEmailDeliveryRate(),
        recent_email_statuses: getRecentEmailStatuses(),
        emailjs_status: checkEmailJSConfiguration()
      },

      // System Health
      system_metrics: {
        paypal_sdk_load_success_rate: getStoredValue('paypal_sdk_success_rate', 0),
        average_page_load_time: getStoredValue('avg_page_load_time', 0),
        client_id_validation_success_rate: getStoredValue('client_id_validation_rate', 0),
        webhook_events_received: getStoredValue('webhook_events', 0),
        last_webhook_received: getStoredValue('last_webhook_time', null)
      },

      // Alerts and Issues
      alerts: generateAlerts(),

      // Configuration Status
      configuration: {
        paypal_environment: 'User-provided Client ID',
        email_notifications: checkEmailJSConfiguration().status,
        webhook_endpoint: '/.netlify/functions/paypal-webhook',
        currency: 'CAD',
        payment_methods: ['PayPal']
      }
    };

    // Handle POST requests to log new events
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      await logEvent(body);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Event logged successfully',
          event_type: body.event_type
        })
      };
    }

    // Handle dashboard view request
    if (event.queryStringParameters?.view === 'dashboard') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/html' },
        body: generateDashboardHTML(analytics)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analytics, null, 2)
    };

  } catch (error) {
    console.error('Analytics error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Analytics system error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Helper functions for data storage and retrieval
// In production, you'd use a real database like MongoDB, PostgreSQL, etc.
function getStoredValue(key, defaultValue) {
  // For demo purposes, returning simulated data
  // In production, retrieve from your database
  const simulatedData = {
    'payment_attempts': 45,
    'successful_payments': 42,
    'failed_payments': 2,
    'cancelled_payments': 1,
    'total_amount_cad': 6300.00,
    'email_attempts': 42,
    'emails_successful': 40,
    'emails_failed': 2,
    'paypal_payments': 42,
    'paypal_sdk_success_rate': 0.95,
    'client_id_validation_rate': 0.98,
    'webhook_events': 38
  };

  return simulatedData[key] || defaultValue;
}

function calculateSuccessRate() {
  const successful = getStoredValue('successful_payments', 0);
  const total = getStoredValue('payment_attempts', 0);
  return total > 0 ? ((successful / total) * 100).toFixed(2) : 0;
}

function calculateAveragePayment() {
  const total = getStoredValue('total_amount_cad', 0);
  const count = getStoredValue('successful_payments', 0);
  return count > 0 ? (total / count).toFixed(2) : 0;
}

function calculateEmailDeliveryRate() {
  const successful = getStoredValue('emails_successful', 0);
  const total = getStoredValue('email_attempts', 0);
  return total > 0 ? ((successful / total) * 100).toFixed(2) : 0;
}

function getRecentPayments() {
  // In production, fetch from database
  return [
    {
      id: 'PAYPAL123456789',
      amount: 150.00,
      currency: 'CAD',
      status: 'completed',
      customer: 'John D.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'PAYPAL987654321',
      amount: 200.00,
      currency: 'CAD',
      status: 'completed',
      customer: 'Sarah M.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function getRecentEmailStatuses() {
  return [
    { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'sent', recipient: 'john@example.com' },
    { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: 'sent', recipient: 'sarah@example.com' },
    { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: 'failed', recipient: 'invalid@email' }
  ];
}

function checkEmailJSConfiguration() {
  const serviceId = process.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = process.env.VITE_EMAILJS_TEMPLATE_ID;
  const userId = process.env.VITE_EMAILJS_USER_ID;

  const isConfigured = !!(serviceId && templateId && userId);

  return {
    status: isConfigured ? 'Configured' : 'Not Configured',
    service_id_set: !!serviceId,
    template_id_set: !!templateId,
    user_id_set: !!userId,
    recommendation: isConfigured ?
      'EmailJS is properly configured' :
      'Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_USER_ID to environment variables'
  };
}

function generateAlerts() {
  const alerts = [];
  const successRate = parseFloat(calculateSuccessRate());
  const emailRate = parseFloat(calculateEmailDeliveryRate());

  if (successRate < 90) {
    alerts.push({
      type: 'warning',
      message: `Payment success rate is ${successRate}% (below 90% threshold)`,
      action: 'Review failed payment logs and PayPal configuration'
    });
  }

  if (emailRate < 85) {
    alerts.push({
      type: 'warning',
      message: `Email delivery rate is ${emailRate}% (below 85% threshold)`,
      action: 'Check EmailJS configuration and service status'
    });
  }

  const emailConfig = checkEmailJSConfiguration();
  if (emailConfig.status === 'Not Configured') {
    alerts.push({
      type: 'info',
      message: 'EmailJS not configured - email notifications disabled',
      action: 'Configure EmailJS environment variables to enable email notifications'
    });
  }

  return alerts;
}

async function logEvent(eventData) {
  // In production, save to database
  console.log('Logging event:', eventData);

  // Example event types:
  // - payment_attempt
  // - payment_success
  // - payment_failure
  // - email_sent
  // - email_failed
  // - paypal_sdk_loaded
  // - client_id_validated
}

function generateDashboardHTML(analytics) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Analytics Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #666; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .alert-warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .alert-info { background: #dbeafe; border-left: 4px solid #3b82f6; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .status-success { color: #059669; font-weight: bold; }
        .status-failed { color: #dc2626; font-weight: bold; }
        .refresh-btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Payment Analytics Dashboard</h1>
        <p>Last updated: ${analytics.timestamp}</p>
        <button class="refresh-btn" onclick="location.reload()">Refresh Data</button>

        <!-- Alerts -->
        <div class="card">
            <h2>🚨 Alerts & Notifications</h2>
            ${analytics.alerts.map(alert => `
                <div class="alert alert-${alert.type}">
                    <strong>${alert.message}</strong><br>
                    <small>Action: ${alert.action}</small>
                </div>
            `).join('')}
            ${analytics.alerts.length === 0 ? '<p style="color: #059669;">✅ No alerts - all systems operating normally</p>' : ''}
        </div>

        <div class="grid">
            <!-- Payment Metrics -->
            <div class="card">
                <h2>💳 Payment Metrics</h2>
                <div class="metric">
                    <div class="metric-value">${analytics.payment_metrics.success_rate}%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analytics.payment_metrics.successful_payments}</div>
                    <div class="metric-label">Successful Payments</div>
                </div>
                <div class="metric">
                    <div class="metric-value">CAD $${analytics.payment_metrics.total_amount_processed}</div>
                    <div class="metric-label">Total Processed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">CAD $${analytics.payment_metrics.average_payment_amount}</div>
                    <div class="metric-label">Average Payment</div>
                </div>
            </div>

            <!-- Email Metrics -->
            <div class="card">
                <h2>📧 Email Delivery Metrics</h2>
                <div class="metric">
                    <div class="metric-value">${analytics.email_metrics.email_delivery_rate}%</div>
                    <div class="metric-label">Delivery Rate</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analytics.email_metrics.emails_sent_successfully}</div>
                    <div class="metric-label">Emails Sent</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analytics.email_metrics.emails_failed}</div>
                    <div class="metric-label">Failed Emails</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analytics.email_metrics.emailjs_status.status}</div>
                    <div class="metric-label">EmailJS Status</div>
                </div>
            </div>
        </div>

        <!-- Recent Payments -->
        <div class="card">
            <h2>💰 Recent Payments</h2>
            <table>
                <thead>
                    <tr><th>Payment ID</th><th>Amount</th><th>Customer</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                    ${analytics.payment_metrics.most_recent_payments.map(payment => `
                        <tr>
                            <td>${payment.id}</td>
                            <td>${payment.currency} $${payment.amount}</td>
                            <td>${payment.customer}</td>
                            <td class="status-${payment.status === 'completed' ? 'success' : 'failed'}">${payment.status}</td>
                            <td>${new Date(payment.timestamp).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- System Configuration -->
        <div class="card">
            <h2>⚙️ System Configuration</h2>
            <table>
                <tr><td><strong>Payment Currency</strong></td><td>${analytics.configuration.currency}</td></tr>
                <tr><td><strong>Payment Methods</strong></td><td>${analytics.configuration.payment_methods.join(', ')}</td></tr>
                <tr><td><strong>Email Notifications</strong></td><td>${analytics.configuration.email_notifications}</td></tr>
                <tr><td><strong>Webhook Endpoint</strong></td><td>${analytics.configuration.webhook_endpoint}</td></tr>
                <tr><td><strong>PayPal Environment</strong></td><td>${analytics.configuration.paypal_environment}</td></tr>
            </table>
        </div>

        <div class="card">
            <h2>📊 API Access</h2>
            <p><strong>JSON Data:</strong> <a href="?format=json">View Raw Analytics Data</a></p>
            <p><strong>Log Event:</strong> POST to this endpoint with event data</p>
            <pre style="background: #f8f8f8; padding: 10px; border-radius: 4px;">
curl -X POST /.netlify/functions/payment-analytics \\
  -H "Content-Type: application/json" \\
  -d '{"event_type": "payment_success", "amount": 150.00, "currency": "CAD"}'
            </pre>
        </div>
    </div>
</body>
</html>`;
}
