import { useState } from 'react';
import { generateSDK } from '../../utils/exporters';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function GenerateClient() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleGenerate = async () => {
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
      setOutput(generateSDK(apiData, language));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Generate Client" description="Auto-generate client code in multiple languages">
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
            </select>
          </div>
          <button onClick={handleGenerate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate Client'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <h3>Generated Client Code</h3>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default GenerateClient;

