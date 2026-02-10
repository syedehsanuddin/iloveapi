import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function GenerateDocs() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      // Generate HTML documentation
      const info = apiData.info || {};
      let html = `<!DOCTYPE html>
<html>
<head>
  <title>${info.title || 'API Documentation'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { color: #333; }
    .endpoint { border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
    .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
  </style>
</head>
<body>
  <h1>${info.title || 'API Documentation'}</h1>
  <p>${info.description || ''}</p>
`;

      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            html += `  <div class="endpoint">
    <span class="method ${method.toLowerCase()}">${method.toUpperCase()}</span>
    <strong>${path}</strong>
    <p>${operation.summary || operation.description || ''}</p>
  </div>\n`;
          });
        });
      }

      html += `</body></html>`;
      setOutput(html);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Generate Docs" description="Create interactive documentation from your API spec">
      <div className="tool-page">
        <div className="input-section">
          <div className="tabs">
            <button className={`tab ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')}>JSON Input</button>
            <button className={`tab ${activeTab === 'url' ? 'active' : ''}`} onClick={() => setActiveTab('url')}>Swagger URL</button>
          </div>
          {activeTab === 'json' ? (
            <textarea className="json-input" value={inputJson} onChange={(e) => setInputJson(e.target.value)} placeholder="Paste your API JSON..." rows={10} />
          ) : (
            <input type="url" className="url-input" value={swaggerUrl} onChange={(e) => setSwaggerUrl(e.target.value)} placeholder="https://api.example.com" />
          )}
          <button onClick={handleGenerate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate Documentation'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <div className="output-header">
              <h3>Generated Documentation</h3>
              <button onClick={() => {
                const blob = new Blob([output], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'api-docs.html';
                a.click();
                URL.revokeObjectURL(url);
              }} className="btn btn-primary">Download HTML</button>
            </div>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default GenerateDocs;

