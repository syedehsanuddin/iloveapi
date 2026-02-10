// Netlify Function for traffic tracking
export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }
  
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: '',
      };
    }
  
    try {
      const body = JSON.parse(event.body || '{}');
      const page = body.page || 'Unknown';
      
      // Get client IP from Netlify headers
      const clientIP = 
        event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        event.headers['x-nf-client-connection-ip'] ||
        event.headers['client-ip'] ||
        'Unknown';
      
      const userAgent = event.headers['user-agent'] || 'Unknown';
  
      // Check if IP is localhost or private
      function isLocalOrPrivateIP(ip) {
        if (ip === 'Unknown') return true;
        if (ip.startsWith('127.') || ip === 'localhost') return true;
        if (ip === '::1' || ip === '::ffff:127.0.0.1') return true;
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return true;
        return false;
      }
  
      // Get country from IP
      async function getCountryFromIP(ip) {
        if (isLocalOrPrivateIP(ip)) {
          return {
            country: 'Local/Private',
            countryCode: 'LOCAL',
            city: 'Localhost',
            region: 'Development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
            ip: ip
          };
        }
  
        try {
          const fetchWithTimeout = (url, timeout = 5000) => {
            return Promise.race([
              fetch(url),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
              )
            ]);
          };
  
          // Try ip-api.com first
          try {
            const response = await fetchWithTimeout(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,timezone,query`);
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success') {
                return {
                  country: data.country || 'Unknown',
                  countryCode: data.countryCode || 'Unknown',
                  city: data.city || 'Unknown',
                  region: data.regionName || 'Unknown',
                  timezone: data.timezone || 'Unknown',
                  ip: data.query || ip
                };
              }
            }
          } catch (apiError) {
            console.warn('ip-api.com failed:', apiError.message);
          }
  
          // Fallback to ipapi.co
          try {
            const response = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`);
            if (response.ok) {
              const data = await response.json();
              if (!data.error) {
                return {
                  country: data.country_name || 'Unknown',
                  countryCode: data.country_code || 'Unknown',
                  city: data.city || 'Unknown',
                  region: data.region || 'Unknown',
                  timezone: data.timezone || 'Unknown',
                  ip: ip
                };
              }
            }
          } catch (fallbackError) {
            console.warn('Fallback API failed:', fallbackError.message);
          }
  
          return {
            country: 'Unknown (API Error)',
            countryCode: 'UNK',
            city: 'Unknown',
            region: 'Unknown',
            timezone: 'Unknown',
            ip: ip
          };
        } catch (error) {
          console.error('Error fetching country:', error);
          return {
            country: 'Unknown (Error)',
            countryCode: 'ERR',
            city: 'Unknown',
            region: 'Unknown',
            timezone: 'Unknown',
            ip: ip
          };
        }
      }
  
      const geoData = await getCountryFromIP(clientIP);
      const timestamp = new Date().toISOString();
      
      // Log to console (viewable in Netlify dashboard)
      const logEntry = `[${timestamp}] IP: ${geoData.ip} | Country: ${geoData.country} (${geoData.countryCode}) | City: ${geoData.city} | Region: ${geoData.region} | Timezone: ${geoData.timezone} | Page: ${page} | User Agent: ${userAgent}`;
      console.log('TRAFFIC_LOG:', logEntry);
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Traffic logged',
          data: geoData
        }),
      };
    } catch (error) {
      console.error('Error in tracking:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Error logging traffic',
          error: error.message
        }),
      };
    }
  };