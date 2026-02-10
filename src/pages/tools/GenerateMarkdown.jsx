import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function GenerateMarkdown() {
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

      const info = apiData.info || {};
      let markdown = `# ${info.title || 'API Documentation'}\n\n`;
      markdown += `${info.description || ''}\n\n`;
      markdown += `## Endpoints\n\n`;

      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, operation]) => {
            markdown += `### \`${method.toUpperCase()}\` ${path}\n\n`;
            markdown += `${operation.summary || operation.description || ''}\n\n`;
          });
        });
      }

      setOutput(markdown);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Export Markdown" description="Generate Markdown documentation from your API spec">
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
          <button onClick={handleGenerate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate Markdown'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <div className="output-header">
              <h3>Markdown Documentation</h3>
              <button onClick={() => {
                const blob = new Blob([output], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'api-docs.md';
                a.click();
                URL.revokeObjectURL(url);
              }} className="btn btn-primary">Download</button>
            </div>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default GenerateMarkdown;

