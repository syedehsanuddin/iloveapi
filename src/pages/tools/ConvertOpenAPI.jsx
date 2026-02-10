import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ConvertOpenAPI() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState('2to3');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleConvert = async () => {
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

      // Simplified conversion (in production, use swagger2openapi library)
      if (direction === '2to3' && apiData.swagger === '2.0') {
        const openapi3 = {
          openapi: '3.0.0',
          info: apiData.info,
          servers: [{ url: apiData.host || 'https://api.example.com', description: 'Default server' }],
          paths: apiData.paths,
          components: { schemas: apiData.definitions || {} }
        };
        setOutput(JSON.stringify(openapi3, null, 2));
      } else {
        setOutput(JSON.stringify(apiData, null, 2));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Convert OpenAPI" description="Convert OpenAPI 2.0 to 3.0 or vice versa">
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
          <div style={{ marginBottom: '1rem' }}>
            <label>Convert: </label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb' }}>
              <option value="2to3">OpenAPI 2.0 → 3.0</option>
              <option value="3to2">OpenAPI 3.0 → 2.0</option>
            </select>
          </div>
          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Converting...' : 'Convert'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <h3>Converted API Spec</h3>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ConvertOpenAPI;

