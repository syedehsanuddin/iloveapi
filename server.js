import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log file path
const LOG_FILE = path.join(__dirname, 'traffic_log.txt');

// Function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'Unknown';
}

// Function to check if IP is localhost or private
function isLocalOrPrivateIP(ip) {
  if (ip === 'Unknown') return true;
  
  // IPv4 localhost
  if (ip.startsWith('127.') || ip === 'localhost') return true;
  
  // IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('::ffff:127.')) return true;
  
  // Private IP ranges (IPv4)
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return true;
  
  // IPv6 private ranges
  if (ip.startsWith('fc00:') || ip.startsWith('fd00:') || ip.startsWith('fe80:')) return true;
  
  return false;
}

// Function to get country from IP using free API
async function getCountryFromIP(ip) {
  // Skip if IP is localhost or private
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
    // Helper function to add timeout to fetch
    const fetchWithTimeout = (url, timeout = 5000) => {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);
    };

    // Try ip-api.com first (free, no API key required, 45 requests/minute limit)
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
      console.warn('ip-api.com failed, trying fallback:', apiError.message);
    }
    
    // Fallback to ipapi.co (free tier: 1000 requests/day)
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
      console.warn('Fallback API also failed:', fallbackError.message);
    }
    
    // If both APIs fail, return unknown
    console.error(`Failed to get geolocation for IP: ${ip}`);
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

// Function to log to file
function logToFile(data) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] IP: ${data.ip} | Country: ${data.country} (${data.countryCode}) | City: ${data.city} | Region: ${data.region} | Timezone: ${data.timezone} | Page: ${data.page || 'N/A'} | User Agent: ${data.userAgent || 'N/A'}\n`;
  
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

// Tracking endpoint
app.post('/api/track', async (req, res) => {
  const clientIP = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const page = req.body.page || 'Unknown';
  
  try {
    const geoData = await getCountryFromIP(clientIP);
    const logData = {
      ...geoData,
      userAgent,
      page
    };
    
    logToFile(logData);
    
    res.json({ 
      success: true, 
      message: 'Traffic logged',
      data: geoData
    });
  } catch (error) {
    console.error('Error in tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging traffic' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tracking server is running' });
});

// Proxy endpoint to fetch Swagger/OpenAPI JSON (bypasses CORS)
app.get('/api/proxy-fetch', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing url parameter' 
    });
  }

  // Validate URL format
  let url;
  try {
    url = new URL(targetUrl);
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid URL format' 
    });
  }

  // Security: Only allow http/https protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return res.status(400).json({ 
      success: false, 
      error: 'Only http and https protocols are allowed' 
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, application/yaml, */*',
        'User-Agent': 'API-Feature-Analyzer/1.0',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      // Verify it's actually Swagger/OpenAPI JSON
      if (json.openapi || json.swagger || json.paths) {
        return res.json({
          success: true,
          data: json,
          url: targetUrl,
          contentType: contentType
        });
      } else {
        // Even if not Swagger, return the JSON if it's valid JSON
        return res.json({
          success: true,
          data: json,
          url: targetUrl,
          contentType: contentType,
          warning: 'Response is valid JSON but may not be Swagger/OpenAPI format'
        });
      }
    } catch (parseError) {
      // Not valid JSON
      return res.status(400).json({
        success: false,
        error: 'Response is not valid JSON',
        contentType: contentType,
        preview: text.substring(0, 200) // First 200 chars for debugging
      });
    }
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch URL',
      details: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Traffic tracking server running on http://localhost:${PORT}`);
  console.log(`📝 Logs will be saved to: ${LOG_FILE}`);
  console.log(`🔗 Proxy endpoint available at: http://localhost:${PORT}/api/proxy-fetch?url=<target-url>`);
});

