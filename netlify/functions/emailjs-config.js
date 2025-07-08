// Simple storage for EmailJS configuration
// In production, you'd use a proper database
let emailjsConfig = null;

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
    // Handle saving configuration
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (body.action === 'save') {
        emailjsConfig = {
          service_id: body.service_id,
          template_id: body.template_id,
          user_id: body.user_id,
          from_name: body.from_name || 'Hellamaid Services',
          saved_at: new Date().toISOString()
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Configuration saved successfully'
          })
        };
      }
    }

    // Return current configuration
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: !!emailjsConfig,
        config: emailjsConfig ? {
          service_id: emailjsConfig.service_id,
          template_id: emailjsConfig.template_id,
          user_id: emailjsConfig.user_id,
          from_name: emailjsConfig.from_name
        } : null
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Configuration error',
        message: error.message
      })
    };
  }
};
