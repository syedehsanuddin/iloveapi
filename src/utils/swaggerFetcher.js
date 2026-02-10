/**
 * Tries to fetch Swagger/OpenAPI JSON from a URL using multiple common patterns
 * Optimized to try the most likely patterns first, especially path-based variations
 */
export async function fetchSwaggerJson(inputUrl) {
  // Normalize the URL
  let url = inputUrl.trim();
  
  // Remove hash fragments and query strings for base URL extraction
  url = url.split('#')[0].split('?')[0];
  
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  
  // Parse URL to extract base domain and path
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (error) {
    // If URL parsing fails, try adding https://
    try {
      urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid URL format. Please provide a valid URL.',
        errors: []
      };
    }
  }
  
  const protocol = urlObj.protocol;
  const hostname = urlObj.hostname;
  const port = urlObj.port ? `:${urlObj.port}` : '';
  const pathname = urlObj.pathname;
  const baseUrl = `${protocol}//${hostname}${port}`;
  
  // Helper function to test a URL and return result
  const testUrl = async (testUrl) => {
    // First, try direct fetch
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/yaml, */*',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        
        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          // Verify it's actually Swagger/OpenAPI JSON
          if (json.openapi || json.swagger || json.paths) {
            return { success: true, data: json, url: testUrl };
          }
        } catch {
          // Not JSON, skip
        }
      }
    } catch (error) {
      // If it's a CORS error or network error, try proxy
      if (error.name === 'TypeError' || error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        try {
          // Use proxy endpoint to bypass CORS
          const proxyUrl = `http://localhost:3001/api/proxy-fetch?url=${encodeURIComponent(testUrl)}`;
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            if (proxyData.success && proxyData.data) {
              // Verify it's Swagger/OpenAPI JSON
              if (proxyData.data.openapi || proxyData.data.swagger || proxyData.data.paths) {
                return { success: true, data: proxyData.data, url: testUrl };
              }
            }
          }
        } catch (proxyError) {
          // Proxy also failed, return null
          console.warn('Proxy fetch also failed:', proxyError);
        }
      }
      // Other errors, return null
      return null;
    }
    return null;
  };

  // PRIORITY 1: Try the original URL directly (in case it's already a JSON endpoint)
  const originalResult = await testUrl(url);
  if (originalResult) return originalResult;

  // PRIORITY 1.5: IMMEDIATELY try the -json pattern (most common case)
  // This is tried separately and first to catch cases like /api/docs -> /api/docs-json
  if (pathname && pathname !== '/') {
    const cleanPath = pathname.replace(/\/$/, '');
    const jsonUrl = `${baseUrl}${cleanPath}-json`;
    const immediateResult = await testUrl(jsonUrl);
    if (immediateResult) return immediateResult;
  }

  // PRIORITY 2: Path-based variations (most common - like /api/docs -> /api/docs-json)
  // These are tried first because they're the most likely to work
  const pathBasedPatterns = [];
  
  if (pathname && pathname !== '/') {
    // Remove trailing slash if present
    const cleanPath = pathname.replace(/\/$/, '');
    
    // HIGHEST PRIORITY: Direct path modifications with -json suffix (most common pattern)
    // This catches cases like /api/docs -> /api/docs-json
    // Note: -json was already tried above, but keeping here for completeness
    pathBasedPatterns.push(
      `${baseUrl}${cleanPath}-json`,           // /api/docs -> /api/docs-json ✓ YOUR CASE (already tried above)
      `${baseUrl}${cleanPath}.json`,           // /api/docs -> /api/docs.json
      `${baseUrl}${cleanPath}/json`,           // /api/docs -> /api/docs/json
      `${baseUrl}${cleanPath}-json.json`,      // /api/docs -> /api/docs-json.json
    );
    
    // Also try with query parameters
    pathBasedPatterns.push(
      `${baseUrl}${cleanPath}?format=json`,     // /api/docs -> /api/docs?format=json
      `${baseUrl}${cleanPath}?output=json`,    // /api/docs -> /api/docs?output=json
      `${baseUrl}${cleanPath}?type=json`,      // /api/docs -> /api/docs?type=json
    );
    
    // Try segment-based variations
    const pathSegments = cleanPath.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const parentPath = pathSegments.length > 1 ? '/' + pathSegments.slice(0, -1).join('/') : '';
      
      // Try modifying just the last segment
      pathBasedPatterns.push(
        `${baseUrl}${parentPath}/${lastSegment}-json`,  // /api/docs -> /api/docs-json (same as above, but via segments)
        `${baseUrl}${parentPath}/${lastSegment}.json`,  // /api/docs -> /api/docs.json
      );
      
      // Try replacing last segment with common names
      if (parentPath) {
        pathBasedPatterns.push(
          `${baseUrl}${parentPath}/swagger.json`,
          `${baseUrl}${parentPath}/api-docs.json`,
          `${baseUrl}${parentPath}/openapi.json`,
          `${baseUrl}${parentPath}/docs-json`,      // In case docs is in parent
          `${baseUrl}${parentPath}/docs.json`,      // In case docs is in parent
        );
      }
      
      // Try removing segments and adding -json
      if (pathSegments.length >= 2) {
        // Try with one less segment
        const shorterPath = '/' + pathSegments.slice(0, -1).join('/');
        pathBasedPatterns.push(
          `${baseUrl}${shorterPath}-json`,
          `${baseUrl}${shorterPath}.json`,
        );
      }
    }
  }

  // Try path-based patterns in parallel (faster)
  const pathBasedPromises = pathBasedPatterns.map(testUrl);
  const pathBasedResults = await Promise.allSettled(pathBasedPromises);
  for (const result of pathBasedResults) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  // PRIORITY 3: Common Swagger/OpenAPI patterns at the same path level
  const commonPatterns = [];
  if (pathname && pathname !== '/') {
    const cleanPath = pathname.replace(/\/$/, '');
    const pathSegments = cleanPath.split('/').filter(Boolean);
    const parentPath = pathSegments.length > 1 ? '/' + pathSegments.slice(0, -1).join('/') : '';
    
    commonPatterns.push(
      `${baseUrl}${parentPath}/swagger.json`,
      `${baseUrl}${parentPath}/api-docs.json`,
      `${baseUrl}${parentPath}/openapi.json`,
      `${baseUrl}${parentPath}/v2/api-docs`,
      `${baseUrl}${parentPath}/v3/api-docs`,
      `${baseUrl}${parentPath}/swagger/v1/swagger.json`,
      `${baseUrl}${parentPath}/swagger/v2/swagger.json`,
      `${baseUrl}${parentPath}/swagger/v3/swagger.json`,
    );
  }

  // PRIORITY 4: Root-level common patterns
  const rootPatterns = [
    '/swagger.json',
    '/api-docs.json',
    '/openapi.json',
    '/v2/swagger.json',
    '/v3/swagger.json',
    '/v1/swagger.json',
    '/api-docs',
    '/v2/api-docs',
    '/v3/api-docs',
    '/swagger/v1/swagger.json',
    '/swagger/v2/swagger.json',
    '/swagger/v3/swagger.json',
    '/api/swagger.json',
    '/api/v1/swagger.json',
    '/api/v2/swagger.json',
    '/api/v3/swagger.json',
    '/api/openapi.json',
  ].map(pattern => `${baseUrl}${pattern}`);

  // Combine common and root patterns
  const allCommonPatterns = [...commonPatterns, ...rootPatterns];
  
  // Try common patterns in parallel (batch of 5 at a time for better performance)
  const batchSize = 5;
  for (let i = 0; i < allCommonPatterns.length; i += batchSize) {
    const batch = allCommonPatterns.slice(i, i + batchSize);
    const batchPromises = batch.map(testUrl);
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }
  }

  // PRIORITY 5: Try parent paths with common patterns
  if (pathname && pathname !== '/') {
    const pathSegments = pathname.split('/').filter(Boolean);
    const parentPatterns = [];
    
    // Try each parent path level
    for (let i = pathSegments.length - 1; i >= 0; i--) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      parentPatterns.push(
        `${baseUrl}${parentPath}/swagger.json`,
        `${baseUrl}${parentPath}/api-docs.json`,
        `${baseUrl}${parentPath}/openapi.json`,
      );
    }
    
    // Try parent patterns in batches
    for (let i = 0; i < parentPatterns.length; i += batchSize) {
      const batch = parentPatterns.slice(i, i + batchSize);
      const batchPromises = batch.map(testUrl);
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }
    }
  }

  return {
    success: false,
    error: 'Couldn\'t detect JSON from the provided URL. Please provide JSON manually.',
    errors: []
  };
}

