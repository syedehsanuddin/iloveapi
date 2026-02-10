import { useState } from 'react';
import { exportToCurl } from '../../utils/exporters';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ExportCurl() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [commands, setCommands] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);
    setCommands([]);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }
      setCommands(exportToCurl(apiData));
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
    <ToolLayout title="Export to cURL" description="Generate ready-to-use cURL commands for all endpoints">
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
          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate cURL Commands'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {commands.length > 0 && (
          <div className="output-section">
            <h3>cURL Commands ({commands.length})</h3>
            <div className="commands-list">
              {commands.map((cmd, idx) => (
                <div key={idx} className="command-item">
                  <div className="command-header">
                    <span className="command-method">{cmd.method}</span>
                    <span className="command-path">{cmd.path}</span>
                    <button onClick={() => copyToClipboard(cmd.command)} className="btn btn-secondary">Copy</button>
                  </div>
                  <pre className="command-code">{cmd.command}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ExportCurl;

