import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function MethodDistribution() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setDistribution(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      const methods = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 };
      
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, pathMethods]) => {
          Object.keys(pathMethods).forEach(method => {
            const upperMethod = method.toUpperCase();
            if (methods[upperMethod] !== undefined) {
              methods[upperMethod]++;
            }
          });
        });
      }

      setDistribution(methods);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Method Distribution" description="See breakdown of GET, POST, PUT, DELETE methods used">
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
          <button onClick={handleAnalyze} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Analyzing...' : 'Analyze Methods'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {distribution && (
          <div className="output-section">
            <h3>Method Distribution</h3>
            <div className="distribution-chart">
              {Object.entries(distribution).map(([method, count]) => (
                <div key={method} className="distribution-item">
                  <div className="distribution-bar" style={{ width: `${(count / Math.max(...Object.values(distribution))) * 100}%` }}></div>
                  <span className="distribution-label">{method}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default MethodDistribution;

