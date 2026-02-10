import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ConvertTypeScript() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleConvert = async () => {
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

      let types = '// Generated TypeScript Types\n\n';
      if (apiData.components?.schemas || apiData.definitions) {
        const schemas = apiData.components?.schemas || apiData.definitions || {};
        Object.entries(schemas).forEach(([name, schema]) => {
          types += `export interface ${name} {\n`;
          if (schema.properties) {
            Object.entries(schema.properties).forEach(([prop, propSchema]) => {
              const type = propSchema.type === 'string' ? 'string' : propSchema.type === 'number' ? 'number' : 'any';
              types += `  ${prop}${schema.required?.includes(prop) ? '' : '?'}: ${type};\n`;
            });
          }
          types += '}\n\n';
        });
      }
      setOutput(types);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Convert to TypeScript" description="Generate TypeScript interfaces from your API schema">
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
          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Converting...' : 'Generate TypeScript Types'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {output && (
          <div className="output-section">
            <h3>TypeScript Types</h3>
            <textarea className="output-textarea" value={output} readOnly rows={20} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ConvertTypeScript;

