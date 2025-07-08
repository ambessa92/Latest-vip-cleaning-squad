exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'text/html'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📧 EmailJS Setup</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: #4f46e5;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .step {
            background: #f8fafc;
            border-left: 4px solid #4f46e5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        .step-number {
            background: #4f46e5;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 10px;
        }
        .form-group {
            margin: 20px 0;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #4f46e5;
        }
        .help-text {
            font-size: 13px;
            color: #6b7280;
            margin-top: 5px;
        }
        .button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin: 10px 0;
        }
        .button:hover {
            background: #4338ca;
        }
        .success {
            background: #d1fae5;
            border: 1px solid #10b981;
            color: #065f46;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            display: none;
        }
        .code-block {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .highlight {
            background: #fef3c7;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 EmailJS Setup</h1>
            <p>Easy email notifications for your payment system</p>
        </div>

        <div class="content">
            <div id="success" class="success">
                ✅ <strong>Setup Complete!</strong> Email notifications are now enabled.
            </div>

            <div class="step">
                <span class="step-number">1</span>
                <strong>Create EmailJS Account</strong><br>
                Go to <a href="https://www.emailjs.com" target="_blank">emailjs.com</a> and sign up for free
            </div>

            <div class="step">
                <span class="step-number">2</span>
                <strong>Add Email Service</strong><br>
                Connect your Gmail, Outlook, or SMTP service
            </div>

            <div class="step">
                <span class="step-number">3</span>
                <strong>Create Email Template</strong><br>
                Use this template for payment confirmations:

                <div class="code-block">
Subject: Payment Confirmation - Booking #{{order_id}}

Dear {{customer_name}},

Thank you for your payment!

💳 Payment Details:
- Amount: {{payment_amount}}
- Payment ID: {{payment_id}}
- Status: {{payment_status}}
- Date: {{payment_date}}

🏠 Service Details:
- Service: {{service_type}}
- Frequency: {{service_frequency}}
- Add-ons: {{service_addons}}

📞 Contact: {{customer_phone}}
📍 Address: {{customer_address}}

Best regards,
Hellamaid Services
                </div>
            </div>

            <div class="step">
                <span class="step-number">4</span>
                <strong>Get Your IDs</strong><br>
                Copy these from your EmailJS dashboard:
            </div>

            <form id="setup-form">
                <div class="form-group">
                    <label for="service_id">📧 Service ID</label>
                    <input type="text" id="service_id" placeholder="service_abc123" required>
                    <div class="help-text">From EmailJS Dashboard → Email Services</div>
                </div>

                <div class="form-group">
                    <label for="template_id">📝 Template ID</label>
                    <input type="text" id="template_id" placeholder="template_xyz789" required>
                    <div class="help-text">From EmailJS Dashboard → Email Templates</div>
                </div>

                <div class="form-group">
                    <label for="user_id">👤 User ID</label>
                    <input type="text" id="user_id" placeholder="user_abcdefghijklmnop" required>
                    <div class="help-text">From EmailJS Dashboard → Account</div>
                </div>

                <button type="submit" class="button">💾 Save Configuration</button>
            </form>

            <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p><strong>Need Help?</strong></p>
                <p>
                    <a href="https://same-ybnqabs99nd-latest.netlify.app" target="_blank">🧮 Back to Calculator</a> |
                    <a href="https://www.emailjs.com/docs/" target="_blank">📚 EmailJS Docs</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const serviceId = document.getElementById('service_id').value;
            const templateId = document.getElementById('template_id').value;
            const userId = document.getElementById('user_id').value;

            // Save to localStorage for now (in real app, save to database)
            localStorage.setItem('emailjs_config', JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: userId,
                saved_at: new Date().toISOString()
            }));

            // Show success message
            document.getElementById('success').style.display = 'block';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Clear form
            document.getElementById('setup-form').reset();
        });
    </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers,
    body: html
  };
};
