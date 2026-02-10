import { useState } from 'react';
import { fetchSwaggerJson } from '../../utils/swaggerFetcher';
import ToolLayout from '../../components/ToolLayout';
import './ToolPage.css';

function CompareAPIs() {
  const [api1, setApi1] = useState('');
  const [api2, setApi2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setComparison(null);

    try {
      const data1 = JSON.parse(api1);
      const data2 = JSON.parse(api2);

      const paths1 = Object.keys(data1.paths || {});
      const paths2 = Object.keys(data2.paths || {});

      const added = paths2.filter(p => !paths1.includes(p));
      const removed = paths1.filter(p => !paths2.includes(p));
      const common = paths1.filter(p => paths2.includes(p));

      setComparison({ added, removed, common, total1: paths1.length, total2: paths2.length });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout title="Compare APIs" description="Diff two API specifications side-by-side">
      <div className="tool-page">
        <div className="input-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>API 1 (JSON):</label>
              <textarea className="json-input" value={api1} onChange={(e) => setApi1(e.target.value)} placeholder="First API JSON..." rows={8} />
            </div>
            <div>
              <label>API 2 (JSON):</label>
              <textarea className="json-input" value={api2} onChange={(e) => setApi2(e.target.value)} placeholder="Second API JSON..." rows={8} />
            </div>
          </div>
          <button onClick={handleCompare} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Comparing...' : 'Compare APIs'}</button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
        {comparison && (
          <div className="output-section">
            <h3>Comparison Results</h3>
            <div className="comparison-stats">
              <div className="stat-item">API 1: {comparison.total1} endpoints</div>
              <div className="stat-item">API 2: {comparison.total2} endpoints</div>
              <div className="stat-item">Common: {comparison.common.length} endpoints</div>
            </div>
            {comparison.added.length > 0 && (
              <div className="diff-section added">
                <h4>Added ({comparison.added.length}):</h4>
                <ul>
                  {comparison.added.map((path, idx) => (
                    <li key={idx}>+ {path}</li>
                  ))}
                </ul>
              </div>
            )}
            {comparison.removed.length > 0 && (
              <div className="diff-section removed">
                <h4>Removed ({comparison.removed.length}):</h4>
                <ul>
                  {comparison.removed.map((path, idx) => (
                    <li key={idx}>- {path}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default CompareAPIs;

