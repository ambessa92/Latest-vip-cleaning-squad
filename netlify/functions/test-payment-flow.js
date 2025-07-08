// Test function for PayPal payment flow
exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const testData = {
      timestamp: new Date().toISOString(),
      test_scenarios: [
        {
          name: 'PayPal Client ID Validation',
          description: 'Test that Client ID format is validated correctly',
          test_cases: [
            {
              input: 'short',
              expected: 'invalid',
              reason: 'Too short (< 20 characters)'
            },
            {
              input: 'AeA1QIZXm8_RrG7BwkdJXYZ123456789',
              expected: 'valid',
              reason: 'Proper length and format'
            },
            {
              input: 'invalid-chars-!@#$%',
              expected: 'invalid',
              reason: 'Contains invalid characters'
            }
          ]
        },
        {
          name: 'PayPal SDK Loading',
          description: 'Test PayPal SDK loading with different scenarios',
          test_cases: [
            {
              scenario: 'Valid Client ID',
              url: 'https://www.paypal.com/sdk/js?client-id=VALID_ID&currency=CAD',
              expected: 'success'
            },
            {
              scenario: 'Invalid Client ID',
              url: 'https://www.paypal.com/sdk/js?client-id=INVALID&currency=CAD',
              expected: 'failure'
            }
          ]
        },
        {
          name: 'Payment Flow',
          description: 'End-to-end payment testing scenarios',
          test_cases: [
            {
              amount: 150.00,
              currency: 'CAD',
              service: 'Standard Cleaning',
              frequency: 'One-time',
              expected_flow: [
                'Client ID validation',
                'PayPal SDK loading',
                'Order creation',
                'Payment approval',
                'Payment capture',
                'Email notification',
                'Webhook confirmation'
              ]
            }
          ]
        },
        {
          name: 'Email Notifications',
          description: 'Test email sending after successful payment',
          requirements: [
            'VITE_EMAILJS_SERVICE_ID configured',
            'VITE_EMAILJS_TEMPLATE_ID configured',
            'VITE_EMAILJS_USER_ID configured',
            'Valid customer email address'
          ]
        },
        {
          name: 'Webhook Handling',
          description: 'Test PayPal webhook event processing',
          webhook_events: [
            'PAYMENT.CAPTURE.COMPLETED',
            'PAYMENT.CAPTURE.DENIED',
            'PAYMENT.CAPTURE.PENDING',
            'PAYMENT.CAPTURE.REFUNDED'
          ],
          webhook_url: '/.netlify/functions/paypal-webhook'
        }
      ],
      testing_instructions: {
        manual_testing: [
          '1. Open the live site: https://same-ybnqabs99nd-latest.netlify.app',
          '2. Fill out the quote form with test data',
          '3. Enter a valid PayPal Client ID (sandbox or live)',
          '4. Complete the payment flow',
          '5. Verify email notification is sent',
          '6. Check Netlify function logs for webhook events'
        ],
        automated_testing: [
          'Use PayPal sandbox environment for testing',
          'Set up PayPal webhook endpoints in developer dashboard',
          'Monitor function logs during test payments',
          'Verify email delivery in EmailJS dashboard'
        ],
        client_id_sources: {
          sandbox: 'https://developer.paypal.com/developer/applications/ (Sandbox)',
          live: 'https://developer.paypal.com/developer/applications/ (Live)'
        }
      },
      current_environment: {
        payment_currency: 'CAD',
        supported_payment_methods: ['PayPal'],
        email_notifications: 'Enabled (if EmailJS configured)',
        webhook_handling: 'Enabled',
        client_id_storage: 'localStorage (persistent)',
        diagnostics: 'Enabled with detailed logging'
      },
      checklist: {
        before_testing: [
          '☐ PayPal Developer Account created',
          '☐ PayPal App created (sandbox/live)',
          '☐ Client ID copied from PayPal dashboard',
          '☐ EmailJS account configured (optional)',
          '☐ Webhook URL configured in PayPal (optional for basic testing)'
        ],
        during_testing: [
          '☐ Client ID validation works',
          '☐ PayPal SDK loads successfully',
          '☐ Payment buttons render',
          '☐ Payment flow completes',
          '☐ Email notification sent (if configured)',
          '☐ Success callback triggered'
        ],
        after_testing: [
          '☐ Payment appears in PayPal dashboard',
          '☐ Customer received confirmation email',
          '☐ Webhook events logged (if configured)',
          '☐ No console errors'
        ]
      }
    };

    // Add environment-specific information
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (body.test_type === 'client_id_validation') {
        const clientId = body.client_id || '';
        const isValid = clientId.length > 20 && /^[A-Za-z0-9_-]+$/.test(clientId);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            test_type: 'client_id_validation',
            client_id_length: clientId.length,
            is_valid: isValid,
            validation_rules: {
              min_length: 20,
              allowed_characters: 'A-Z, a-z, 0-9, _, -'
            }
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(testData, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Test function error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
