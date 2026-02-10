import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function DependencyGraph() {
  const [inputJson, setInputJson] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('json');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setGraph(null);

    try {
      let apiData;
      if (activeTab === 'url') {
        const result = await fetchSwaggerJson(swaggerUrl);
        if (!result.success) throw new Error(result.error);
        apiData = result.data;
      } else {
        apiData = JSON.parse(inputJson);
      }

      const nodes = [];
      const edges = [];
      
      if (apiData.paths) {
        Object.entries(apiData.paths).forEach(([path, methods]) => {
          const pathParts = path.split('/').filter(Boolean);
          pathParts.forEach((part, idx) => {
            if (!nodes.find(n => n.id === part)) {
              nodes.push({ id: part, label: part });
            }
            if (idx > 0) {
              edges.push({ from: pathParts[idx - 1], to: part });
            }
          });
        });
      }

      setGraph({ nodes, edges });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Dependency Graph" description="Visualize how endpoints relate to each other">
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
          <button onClick={handleAnalyze} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Analyzing...' : 'Generate Graph'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {graph && (
          <div className="output-section">
            <h3>Dependency Graph</h3>
            <p>Nodes: {graph.nodes.length} | Edges: {graph.edges.length}</p>
            <div className="graph-visualization">
              {graph.nodes.map(node => (
                <div key={node.id} className="graph-node">{node.label}</div>
              ))}
            </div>
            <p className="info-text">💡 Full graph visualization would require a library like D3.js or vis.js</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default DependencyGraph;

