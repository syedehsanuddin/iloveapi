// Netlify Function for CORS proxy
export const handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: '',
      };
    }
  
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }
  
    const targetUrl = event.queryStringParameters?.url;
  
    if (!targetUrl) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing url parameter'
        }),
      };
    }
  
    // Validate URL format
    let url;
    try {
      url = new URL(targetUrl);
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid URL format'
        }),
      };
    }
  
    // Security: Only allow http/https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Only http and https protocols are allowed'
        }),
      };
    }
  
    try {
      const fetchWithTimeout = (url, timeout = 10000) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };
  
      const response = await fetchWithTimeout(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/yaml, */*',
          'User-Agent': 'API-Feature-Analyzer/1.0',
        },
      });
  
      if (!response.ok) {
        return {
          statusCode: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status
          }),
        };
      }
  
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
  
      // Try to parse as JSON
      try {
        const json = JSON.parse(text);
        // Verify it's actually Swagger/OpenAPI JSON
        if (json.openapi || json.swagger || json.paths) {
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              success: true,
              data: json,
              url: targetUrl,
              contentType: contentType
            }),
          };
        } else {
          // Even if not Swagger, return the JSON if it's valid JSON
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              success: true,
              data: json,
              url: targetUrl,
              contentType: contentType,
              warning: 'Response is valid JSON but may not be Swagger/OpenAPI format'
            }),
          };
        }
      } catch (parseError) {
        // Not valid JSON
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            error: 'Response is not valid JSON',
            contentType: contentType,
            preview: text.substring(0, 200)
          }),
        };
      }
    } catch (error) {
      console.error('Proxy fetch error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: error.message || 'Failed to fetch URL',
          details: error.toString()
        }),
      };
    }
  };