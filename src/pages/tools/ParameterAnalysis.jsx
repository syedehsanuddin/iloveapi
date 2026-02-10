import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ParameterAnalysis() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      const params = { total: 0, required: 0, optional: 0, byType: {}, byLocation: {} };
      
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            if (operation.parameters) {
              operation.parameters.forEach(param => {
                params.total++;
                if (param.required) params.required++;
                else params.optional++;
                params.byType[param.type || 'unknown'] = (params.byType[param.type || 'unknown'] || 0) + 1;
                params.byLocation[param.in || 'unknown'] = (params.byLocation[param.in || 'unknown'] || 0) + 1;
              });
            }
          });
        });
      }

      setAnalysis(params);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Parameter Analysis" description="Analyze all parameters, their types, and required/optional status">
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
          <button onClick={handleAnalyze} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Analyzing...' : 'Analyze Parameters'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {analysis && (
          <div className="output-section">
            <h3>Parameter Analysis</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <strong>Total Parameters:</strong> {analysis.total}
              </div>
              <div className="stat-item">
                <strong>Required:</strong> {analysis.required}
              </div>
              <div className="stat-item">
                <strong>Optional:</strong> {analysis.optional}
              </div>
            </div>
            <div className="analysis-details">
              <h4>By Type:</h4>
              <ul>
                {Object.entries(analysis.byType).map(([type, count]) => (
                  <li key={type}>{type}: {count}</li>
                ))}
              </ul>
              <h4>By Location:</h4>
              <ul>
                {Object.entries(analysis.byLocation).map(([location, count]) => (
                  <li key={location}>{location}: {count}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ParameterAnalysis;

