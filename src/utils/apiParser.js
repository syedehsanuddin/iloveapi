/**
 * Parses OpenAPI/Swagger JSON and extracts endpoint information
 */
export function parseApiJson(apiJson) {
  try {
    const data = typeof apiJson === 'string' ? JSON.parse(apiJson) : apiJson;
    
    // Handle OpenAPI 3.x format
    if (data.openapi || data.swagger === '2.0') {
      return parseOpenApi(data);
    }
    
    // Handle generic API JSON (try to detect structure)
    return parseGenericApi(data);
  } catch (error) {
    throw new Error(`Failed to parse API JSON: ${error.message}`);
  }
}

function parseOpenApi(data) {
  const paths = data.paths || {};
  const endpoints = [];
  const categories = new Set();
  
  // Extract tags/categories from OpenAPI spec
  const tags = data.tags || [];
  tags.forEach(tag => categories.add(tag.name || tag));
  
  // Parse each path
  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operation: operation.operationId || `${method} ${path}`,
          tags: operation.tags || ['default']
        });
        
        // Add tags to categories
        if (operation.tags) {
          operation.tags.forEach(tag => categories.add(tag));
        } else {
          categories.add('default');
        }
      }
    });
  });
  
  // Count endpoints per category
  const endpointsPerCategory = {};
  categories.forEach(category => {
    endpointsPerCategory[category] = endpoints.filter(
      ep => ep.tags.includes(category)
    ).length;
  });
  
  return {
    totalEndpoints: endpoints.length,
    totalCategories: categories.size,
    endpointsPerCategory: Object.fromEntries(
      Array.from(categories).map(cat => [cat, endpointsPerCategory[cat]])
    ),
    endpoints: endpoints
  };
}

function parseGenericApi(data) {
  const endpoints = [];
  const categories = new Set();
  
  // Try to detect common API JSON structures
  if (data.endpoints) {
    // Structure: { endpoints: [...] }
    data.endpoints.forEach(endpoint => {
      const category = endpoint.category || endpoint.tag || 'default';
      categories.add(category);
      endpoints.push({
        path: endpoint.path || endpoint.url || endpoint.endpoint,
        method: endpoint.method || 'GET',
        operation: endpoint.name || endpoint.operation || `${endpoint.method || 'GET'} ${endpoint.path || endpoint.url}`,
        tags: [category]
      });
    });
  } else if (data.routes) {
    // Structure: { routes: [...] }
    data.routes.forEach(route => {
      const category = route.category || route.tag || 'default';
      categories.add(category);
      endpoints.push({
        path: route.path || route.url,
        method: route.method || 'GET',
        operation: route.name || route.operation || `${route.method || 'GET'} ${route.path || route.url}`,
        tags: [category]
      });
    });
  } else if (data.apis) {
    // Structure: { apis: [...] }
    data.apis.forEach(api => {
      const category = api.category || api.tag || 'default';
      categories.add(category);
      endpoints.push({
        path: api.path || api.url || api.endpoint,
        method: api.method || 'GET',
        operation: api.name || api.operation || `${api.method || 'GET'} ${api.path || api.url}`,
        tags: [category]
      });
    });
  } else {
    // Try to parse as array of endpoints
    const items = Array.isArray(data) ? data : Object.values(data);
    items.forEach(item => {
      if (item.path || item.url || item.endpoint) {
        const category = item.category || item.tag || 'default';
        categories.add(category);
        endpoints.push({
          path: item.path || item.url || item.endpoint,
          method: item.method || 'GET',
          operation: item.name || item.operation || `${item.method || 'GET'} ${item.path || item.url}`,
          tags: [category]
        });
      }
    });
  }
  
  // Count endpoints per category
  const endpointsPerCategory = {};
  categories.forEach(category => {
    endpointsPerCategory[category] = endpoints.filter(
      ep => ep.tags.includes(category)
    ).length;
  });
  
  return {
    totalEndpoints: endpoints.length,
    totalCategories: categories.size,
    endpointsPerCategory: Object.fromEntries(
      Array.from(categories).map(cat => [cat, endpointsPerCategory[cat]])
    ),
    endpoints: endpoints
  };
}

