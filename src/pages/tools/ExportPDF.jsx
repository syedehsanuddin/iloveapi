import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function ExportPDF() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }
      
      // Generate PDF content (simplified - in production, use a PDF library)
      const pdfContent = generatePDFContent(apiData);
      alert('PDF generation would happen here. In production, use a library like jsPDF or pdfkit.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFContent = (data) => {
    // Placeholder for PDF generation
    return JSON.stringify(data, null, 2);
  };

  return (
    <ToolLayout title="Export to PDF" description="Create printable PDF documentation from your API spec">
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
          <button onClick={handleGenerate} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Generating...' : 'Generate PDF'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        <div className="info-box">
          <p>📄 PDF generation requires a PDF library. This is a placeholder implementation.</p>
        </div>
      </div>
    </ToolLayout>
  );
}

export default ExportPDF;

