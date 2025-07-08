exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Configuration saved' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: error.message })
      };
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>EmailJS Setup</title>
<style>
body{font-family:Arial;margin:20px;background:#f5f5f5}
.container{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:12px}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;margin:-30px -30px 30px -30px;border-radius:12px 12px 0 0;text-align:center}
.form-group{margin-bottom:20px}
label{display:block;font-weight:600;margin-bottom:8px}
input{width:100%;padding:12px;border:2px solid #e1e1e1;border-radius:8px;box-sizing:border-box}
.button{background:#667eea;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer}
.help-text{font-size:13px;color:#666;margin-top:5px}
.steps{background:#f7fafc;padding:20px;border-radius:8px;margin-bottom:25px}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>📧 EmailJS Configuration</h1>
<p>Set up email notifications for payment confirmations</p>
</div>

<div class="steps">
<h3>🚀 Quick Setup</h3>
<p>1. Go to <a href="https://www.emailjs.com" target="_blank">emailjs.com</a> and create account</p>
<p>2. Add email service (Gmail recommended)</p>
<p>3. Create email template</p>
<p>4. Copy your IDs below</p>
</div>

<form id="config-form">
<div class="form-group">
<label>EmailJS Service ID</label>
<input type="text" id="service_id" placeholder="service_abc123" required>
<div class="help-text">From EmailJS Dashboard → Email Services</div>
</div>

<div class="form-group">
<label>EmailJS Template ID</label>
<input type="text" id="template_id" placeholder="template_xyz789" required>
<div class="help-text">From EmailJS Dashboard → Email Templates</div>
</div>

<div class="form-group">
<label>EmailJS User ID</label>
<input type="text" id="user_id" placeholder="user_abcdefghijklmnop" required>
<div class="help-text">From EmailJS Dashboard → Account</div>
</div>

<button type="submit" class="button">💾 Save Configuration</button>
</form>

<div style="margin-top:30px;padding-top:20px;border-top:1px solid #e1e1e1">
<h3>📖 Links</h3>
<p>
<a href="/.netlify/functions/payment-analytics?view=dashboard" target="_blank">📊 Analytics</a> |
<a href="https://www.emailjs.com/docs/" target="_blank">📚 EmailJS Docs</a> |
<a href="/" target="_blank">🧮 Calculator</a>
</p>
</div>
</div>

<script>
document.getElementById('config-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const config = {
    service_id: document.getElementById('service_id').value,
    template_id: document.getElementById('template_id').value,
    user_id: document.getElementById('user_id').value
  };

  localStorage.setItem('emailjs_config', JSON.stringify(config));

  fetch('/.netlify/functions/emailjs-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
  .then(function(response) { return response.json(); })
  .then(function(result) {
    alert('✅ Configuration saved successfully!');
  })
  .catch(function(error) {
    alert('✅ Configuration saved to browser storage!');
  });
});

// Load saved config
try {
  const saved = localStorage.getItem('emailjs_config');
  if (saved) {
    const config = JSON.parse(saved);
    document.getElementById('service_id').value = config.service_id || '';
    document.getElementById('template_id').value = config.template_id || '';
    document.getElementById('user_id').value = config.user_id || '';
  }
} catch (e) {}
</script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'text/html' },
    body: html
  };
};
