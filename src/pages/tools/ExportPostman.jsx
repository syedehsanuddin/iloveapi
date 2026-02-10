import { useState } from 'react';
import { exportToPostman } from '../../utils/exporters';
import { parseApiJson } from '../../utils/apiParser';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ExportPostman() {
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
        if (!swaggerUrl.trim()) {
          setError('Please provide a Swagger URL');
          return;
        }
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) {
          setError(result.error);
          return;
        }
        apiData = result.data;
      } else {
        if (!inputJson.trim()) {
          setError('Please provide API JSON');
          return;
        }
        apiData = JSON.parse(inputJson);
      }

      const postmanCollection = exportToPostman(apiData);
      setOutput(postmanCollection);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postman-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="Export to Postman"
      description="Convert your API or Swagger JSON into a Postman collection"
    >
      <div className="tool-page">
        <div className="input-section">
          <div className="tabs">
            <button className={`tab ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')}>
              JSON Input
            </button>
            <button className={`tab ${activeTab === 'url' ? 'active' : ''}`} onClick={() => setActiveTab('url')}>
              Swagger URL
            </button>
          </div>

          {activeTab === 'json' ? (
            <textarea
              className="json-input"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="Paste your API JSON here..."
              rows={10}
            />
          ) : (
            <input
              type="url"
              className="url-input"
              value={swaggerUrl}
              onChange={(e) => setSwaggerUrl(e.target.value)}
              placeholder="https://api.example.com"
            />
          )}

          <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Converting...' : 'Convert to Postman'}
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {output && (
          <div className="output-section">
            <div className="output-header">
              <h3>Postman Collection</h3>
              <button onClick={handleDownload} className="btn btn-primary">
                Download JSON
              </button>
            </div>
            <textarea className="output-textarea" value={output} readOnly rows={15} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ExportPostman;

