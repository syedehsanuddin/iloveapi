import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function SecurityAudit() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleAudit = async () => {
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
      
      // Check for authentication
      if (!apiData.security && !apiData.components?.securitySchemes) {
        issues.push('No authentication/authorization defined');
      }

      // Check for HTTPS
      if (apiData.servers) {
        apiData.servers.forEach(server => {
          if (server.url && !server.url.startsWith('https://')) {
            issues.push(`Server URL not using HTTPS: ${server.url}`);
          }
        });
      }

      // Check for sensitive data in paths
      if (apiData.paths) {
        Object.keys(apiData.paths).forEach(path => {
          if (path.toLowerCase().includes('password') || path.toLowerCase().includes('secret')) {
            issues.push(`Potentially sensitive path: ${path}`);
          }
        });
      }

      setResults({ issues, score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10) });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Security Audit" description="Scan for missing authentication, insecure endpoints, or security issues">
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
          <button onClick={handleAudit} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Auditing...' : 'Run Security Audit'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {results && (
          <div className="output-section">
            <div className="security-score">
              <h3>Security Score: {results.score}/100</h3>
            </div>
            {results.issues.length > 0 && (
              <div className="issues-list">
                <h4>Security Issues:</h4>
                <ul>
                  {results.issues.map((issue, idx) => (
                    <li key={idx} className="issue-item">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.issues.length === 0 && <p>✅ No security issues found!</p>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SecurityAudit;

