import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ValidateAPI() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleValidate = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      const issues = [];
      const warnings = [];

      // Basic validation
      if (!apiData.openapi && !apiData.swagger) {
        issues.push('Missing OpenAPI/Swagger version');
      }

      if (!apiData.info) {
        issues.push('Missing info section');
      }

      if (!apiData.paths || Object.keys(apiData.paths).length === 0) {
        warnings.push('No paths defined');
      }

      // Check for missing descriptions
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            if (!operation.summary && !operation.description) {
              warnings.push(`${method.toUpperCase()} ${path}: Missing description`);
            }
          });
        });
      }

      setResults({
        valid: issues.length === 0,
        issues,
        warnings,
        summary: {
          totalIssues: issues.length,
          totalWarnings: warnings.length
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Validate API" description="Check if your API spec follows standards and has errors">
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
          <button onClick={handleValidate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Validating...' : 'Validate API'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {results && (
          <div className="output-section">
            <div className={`validation-result ${results.valid ? 'valid' : 'invalid'}`}>
              <h3>{results.valid ? '✅ Valid' : '❌ Invalid'}</h3>
              <p>Issues: {results.summary.totalIssues} | Warnings: {results.summary.totalWarnings}</p>
            </div>
            {results.issues.length > 0 && (
              <div className="issues-list">
                <h4>Issues:</h4>
                <ul>
                  {results.issues.map((issue, idx) => (
                    <li key={idx} className="issue-item">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.warnings.length > 0 && (
              <div className="warnings-list">
                <h4>Warnings:</h4>
                <ul>
                  {results.warnings.map((warning, idx) => (
                    <li key={idx} className="warning-item">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ValidateAPI;

