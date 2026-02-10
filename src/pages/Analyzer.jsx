import { useState } from 'react';
import { parseApiJson } from '../utils/apiParser';
import { fetchSwaggerJson } from '../utils/swaggerFetcher';
import ToolLayout from '../components/ToolLayout';
import './Analyzer.css';

function Analyzer() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleAnalyze = () => {
    if (!inputJson.trim()) {
      setError('Please provide API JSON');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = parseApiJson(inputJson);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputJson(event.target.result);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsText(file);
    }
  };

  const handleFetchFromUrl = async () => {
    if (!swaggerUrl.trim()) {
      setError('Please provide a Swagger URL');
      return;
    }

    setIsFetchingUrl(true);
    setError(null);
    setAnalysis(null);
    setInputJson('');

    try {
      const result = await fetchSwaggerJson(swaggerUrl);
      
      if (result.success) {
        const analysisResult = parseApiJson(result.data);
        setAnalysis(analysisResult);
        setInputJson(JSON.stringify(result.data, null, 2));
        setError(null);
        setActiveTab('json');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to fetch Swagger JSON: ${err.message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleClear = () => {
    setInputJson('');
    setSwaggerUrl('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="API Analyzer"
      description="Analyze your API or Swagger JSON to see endpoints, categories, and structure"
    >
      <div className="analyzer-container">
        <div className="input-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              JSON Input
            </button>
            <button
              className={`tab ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              Swagger URL
            </button>
          </div>

          {activeTab === 'json' ? (
            <>
              <div className="input-header">
                <label htmlFor="json-input" className="input-label">
                  Paste your API JSON or Swagger JSON
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="file-input"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="file-input" className="file-label">
                    Upload JSON
                  </label>
                </div>
              </div>
              <textarea
                id="json-input"
                className="json-input"
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder='Paste your API JSON here...'
                rows={12}
              />
              <div className="button-group">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || isFetchingUrl}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze API'}
                </button>
                <button
                  onClick={handleClear}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="input-header">
                <label htmlFor="url-input" className="input-label">
                  Enter Swagger/OpenAPI URL
                </label>
              </div>
              <div className="url-input-wrapper">
                <input
                  id="url-input"
                  type="url"
                  className="url-input"
                  value={swaggerUrl}
                  onChange={(e) => setSwaggerUrl(e.target.value)}
                  placeholder="https://api.example.com or https://api.example.com/api/documentation"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchFromUrl();
                    }
                  }}
                />
              </div>
              <div className="button-group">
                <button
                  onClick={handleFetchFromUrl}
                  disabled={isFetchingUrl || isLoading}
                  className="btn btn-primary"
                >
                  {isFetchingUrl ? 'Fetching & Analyzing...' : 'Fetch & Analyze'}
                </button>
                <button
                  onClick={handleClear}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              </div>
              <p className="url-hint">
                The app will automatically try common Swagger JSON endpoints like /swagger.json, /api-docs, /v2/api-docs, etc.
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {analysis && (
          <div className="results-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{analysis.totalEndpoints}</div>
                <div className="stat-label">Total Endpoints</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.totalCategories}</div>
                <div className="stat-label">Total Categories</div>
              </div>
            </div>

            <div className="categories-section">
              <h2 className="section-title">Endpoints by Category</h2>
              <div className="categories-grid">
                {Object.entries(analysis.endpointsPerCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category} className="category-card">
                      <div className="category-name">{category}</div>
                      <div className="category-count">{count} endpoint{count !== 1 ? 's' : ''}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default Analyzer;

