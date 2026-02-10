import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ComplexityScore() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    setScore(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      let complexity = 0;
      const metrics = {
        endpoints: 0,
        methods: 0,
        parameters: 0,
        schemas: 0
      };

      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          metrics.endpoints++;
          Object.entries(methods).forEach(([method, operation]) => {
            metrics.methods++;
            if (operation.parameters) {
              metrics.parameters += operation.parameters.length;
            }
          });
        });
      }

      if (apiData.components?.schemas) {
        metrics.schemas = Object.keys(apiData.components.schemas).length;
      } else if (apiData.definitions) {
        metrics.schemas = Object.keys(apiData.definitions).length;
      }

      complexity = metrics.endpoints * 2 + metrics.methods + metrics.parameters * 0.5 + metrics.schemas * 3;
      const normalizedScore = Math.min(100, Math.round(complexity / 10));

      setScore({ ...metrics, complexity, score: normalizedScore });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Complexity Score" description="Calculate how complex your API is based on endpoints, parameters, etc.">
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
          <button onClick={handleCalculate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Calculating...' : 'Calculate Complexity'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {score && (
          <div className="output-section">
            <div className="complexity-score-display">
              <h2>Complexity Score: {score.score}/100</h2>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${score.score}%` }}></div>
              </div>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <strong>Endpoints:</strong> {score.endpoints}
              </div>
              <div className="metric-item">
                <strong>Methods:</strong> {score.methods}
              </div>
              <div className="metric-item">
                <strong>Parameters:</strong> {score.parameters}
              </div>
              <div className="metric-item">
                <strong>Schemas:</strong> {score.schemas}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ComplexityScore;

