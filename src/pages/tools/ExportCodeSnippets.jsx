import { useState } from 'react';
import { exportToCodeSnippets } from '../../utils/exporters';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ExportCodeSnippets() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);
    setSnippets([]);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }
      setSnippets(exportToCodeSnippets(apiData, language));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolLayout title="Code Snippets" description="Generate code examples in multiple languages">
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
            <label>Language: </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb' }}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
            </select>
          </div>
          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate Code Snippets'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {snippets.length > 0 && (
          <div className="output-section">
            <h3>Code Snippets ({snippets.length})</h3>
            <div className="snippets-list">
              {snippets.map((snippet, idx) => (
                <div key={idx} className="snippet-item">
                  <div className="snippet-header">
                    <span className="snippet-method">{snippet.method}</span>
                    <span className="snippet-path">{snippet.path}</span>
                    <button onClick={() => copyToClipboard(snippet.code)} className="btn btn-secondary">Copy</button>
                  </div>
                  <pre className="snippet-code">{snippet.code}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ExportCodeSnippets;

