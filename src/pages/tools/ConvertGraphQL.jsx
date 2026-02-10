import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ConvertGraphQL() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
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

      // Generate basic GraphQL schema
      let schema = 'type Query {\n';
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method]) => {
            if (method.toLowerCase() === 'get') {
              const fieldName = path.replace(/\//g, '').replace(/\{|\}/g, '') || 'query';
              schema += `  ${fieldName}: String\n`;
            }
          });
        });
      }
      schema += '}';
      setOutput(schema);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Convert to GraphQL" description="Transform REST API spec into GraphQL schema">
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
          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Converting...' : 'Convert to GraphQL'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <h3>GraphQL Schema</h3>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ConvertGraphQL;

