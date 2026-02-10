import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function GenerateServerStubs() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
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

      let stubs = '// Generated Server Stubs\n\n';
      stubs += 'const express = require("express");\n';
      stubs += 'const app = express();\n\n';
      stubs += 'app.use(express.json());\n\n';

      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            stubs += `app.${method.toLowerCase()}('${path}', (req, res) => {\n`;
            stubs += `  // TODO: Implement ${operation.summary || method.toUpperCase() + ' ' + path}\n`;
            stubs += `  res.json({ message: 'Not implemented' });\n`;
            stubs += `});\n\n`;
          });
        });
      }

      stubs += 'app.listen(3000, () => {\n';
      stubs += '  console.log("Server running on port 3000");\n';
      stubs += '});\n';

      setOutput(stubs);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Generate Server Stubs" description="Create server boilerplate code from your API spec">
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
          <button onClick={handleGenerate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate Server Stubs'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <h3>Generated Server Stubs</h3>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default GenerateServerStubs;

