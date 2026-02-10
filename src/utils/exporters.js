/**
 * Export utilities for converting API specs to various formats
 */

export function exportToPostman(apiData) {
  const data = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
  const info = data.info || {};
  
  const collection = {
    info: {
      name: info.title || 'API Collection',
      description: info.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: []
  };

  if (data.paths) {
    Object.entries(data.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const item = {
            name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
            request: {
              method: method.toUpperCase(),
              header: [],
              url: {
                raw: `{{baseUrl}}${path}`,
                host: ['{{baseUrl}}'],
                path: path.split('/').filter(Boolean)
              }
            }
          };

          if (operation.parameters) {
            operation.parameters.forEach(param => {
              if (param.in === 'header') {
                item.request.header.push({
                  key: param.name,
                  value: param.example || '',
                  description: param.description
                });
              }
            });
          }

          collection.item.push(item);
        }
      });
    });
  }

  return JSON.stringify(collection, null, 2);
}

export function exportToInsomnia(apiData) {
  const data = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
  const info = data.info || {};
  
  const resources = {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'api-tools',
    resources: []
  };

  if (data.paths) {
    Object.entries(data.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          resources.resources.push({
            _id: `req_${Math.random().toString(36).substr(2, 9)}`,
            _type: 'request',
            parentId: null,
            modified: Date.now(),
            created: Date.now(),
            url: `{{ _.base_url }}${path}`,
            name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            body: {},
            parameters: [],
            headers: [],
            authentication: {}
          });
        }
      });
    });
  }

  return JSON.stringify(resources, null, 2);
}

export function exportToCurl(apiData) {
  const data = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
  const commands = [];

  if (data.paths) {
    Object.entries(data.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          let curl = `curl -X ${method.toUpperCase()} "https://api.example.com${path}"`;
          
          if (operation.parameters) {
            operation.parameters.forEach(param => {
              if (param.in === 'header') {
                curl += ` \\\n  -H "${param.name}: ${param.example || 'value'}"`;
              }
            });
          }

          if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
            curl += ` \\\n  -H "Content-Type: application/json"`;
            curl += ` \\\n  -d '{}'`;
          }

          commands.push({
            method: method.toUpperCase(),
            path,
            command: curl,
            description: operation.summary || operation.description || ''
          });
        }
      });
    });
  }

  return commands;
}

export function exportToCodeSnippets(apiData, language = 'javascript') {
  const data = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
  const snippets = [];

  if (data.paths) {
    Object.entries(data.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          let snippet = '';
          
          switch (language) {
            case 'javascript':
              snippet = `fetch('https://api.example.com${path}', {
  method: '${method.toUpperCase()}',
  headers: {
    'Content-Type': 'application/json',
  },
  ${['post', 'put', 'patch'].includes(method.toLowerCase()) ? "body: JSON.stringify({})," : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
              break;
            case 'python':
              snippet = `import requests

response = requests.${method.toLowerCase()}(
    'https://api.example.com${path}',
    headers={'Content-Type': 'application/json'},
    ${['post', 'put', 'patch'].includes(method.toLowerCase()) ? "json={}," : ''}
)
print(response.json())`;
              break;
            case 'php':
              snippet = `<?php
$ch = curl_init('https://api.example.com${path}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method.toUpperCase()}');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
${['post', 'put', 'patch'].includes(method.toLowerCase()) ? "curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));" : ''}
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
              break;
            default:
              snippet = `// ${language} code snippet for ${method.toUpperCase()} ${path}`;
          }

          snippets.push({
            method: method.toUpperCase(),
            path,
            language,
            code: snippet,
            description: operation.summary || operation.description || ''
          });
        }
      });
    });
  }

  return snippets;
}

export function generateSDK(apiData, language = 'javascript') {
  const data = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
  const info = data.info || {};
  
  let sdk = '';
  
  switch (language) {
    case 'javascript':
      sdk = `// ${info.title || 'API'} Client SDK\n`;
      sdk += `class APIClient {\n`;
      sdk += `  constructor(baseURL = 'https://api.example.com') {\n`;
      sdk += `    this.baseURL = baseURL;\n`;
      sdk += `  }\n\n`;
      
      if (data.paths) {
        Object.entries(data.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            const methodName = (operation.operationId || `${method}${path.replace(/\//g, '').replace(/\{|\}/g, '')}`)
              .replace(/[^a-zA-Z0-9]/g, '');
            sdk += `  ${methodName}() {\n`;
            sdk += `    return fetch(\`\${this.baseURL}${path}\`, {\n`;
            sdk += `      method: '${method.toUpperCase()}',\n`;
            sdk += `      headers: { 'Content-Type': 'application/json' }\n`;
            sdk += `    }).then(res => res.json());\n`;
            sdk += `  }\n\n`;
          });
        });
      }
      
      sdk += `}\n\n`;
      sdk += `export default APIClient;`;
      break;
    default:
      sdk = `// SDK for ${language}\n// Implementation for ${info.title || 'API'}`;
  }
  
  return sdk;
}

