import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function TestEndpoints() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleLoad = async () => {
    setIsLoading(true);
    setError(null);
    setEndpoints([]);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      const endpointList = [];
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method]) => {
            endpointList.push({ method: method.toUpperCase(), path, url: `https://api.example.com${path}` });
          });
        });
      }
      setEndpoints(endpointList);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (endpoint) => {
    try {
      const response = await fetch(endpoint.url, { method: endpoint.method });
      alert(`Status: ${response.status} ${response.statusText}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <ToolLayout title="Test Endpoints" description="Send HTTP requests to test if endpoints work">
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
          <button onClick={handleLoad} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Loading...' : 'Load Endpoints'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {endpoints.length > 0 && (
          <div className="output-section">
            <h3>Endpoints ({endpoints.length})</h3>
            <div className="endpoints-list">
              {endpoints.map((ep, idx) => (
                <div key={idx} className="endpoint-item">
                  <span className="endpoint-method">{ep.method}</span>
                  <span className="endpoint-path">{ep.path}</span>
                  <button onClick={() => handleTest(ep)} className="btn btn-secondary">Test</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default TestEndpoints;

