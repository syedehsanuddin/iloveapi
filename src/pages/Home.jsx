import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import './Home.css';

const allTools = [
  { name: 'API Analyzer', path: '/analyzer', desc: 'Analyze endpoints, categories, and structure', category: 'Analysis', iconName: 'api' },
  { name: 'Dependency Graph', path: '/analyze/dependency-graph', desc: 'Visualize endpoint relationships', category: 'Analysis', iconName: 'graph' },
  { name: 'Method Distribution', path: '/analyze/method-distribution', desc: 'See GET, POST, PUT, DELETE breakdown', category: 'Analysis', iconName: 'chart' },
  { name: 'Parameter Analysis', path: '/analyze/parameters', desc: 'Analyze all parameters and types', category: 'Analysis', iconName: 'search' },
  { name: 'Complexity Score', path: '/analyze/complexity', desc: 'Calculate API complexity metrics', category: 'Analysis', iconName: 'complexity' },
  { name: 'Export to Postman', path: '/export/postman', desc: 'Convert to Postman collection', category: 'Export', iconName: 'postman' },
  { name: 'Export to Insomnia', path: '/export/insomnia', desc: 'Convert to Insomnia collection', category: 'Export', iconName: 'insomnia' },
  { name: 'Export to cURL', path: '/export/curl', desc: 'Generate cURL commands', category: 'Export', iconName: 'curl' },
  { name: 'Code Snippets', path: '/export/code-snippets', desc: 'Generate code examples', category: 'Export', iconName: 'snippets' },
  { name: 'Export to PDF', path: '/export/pdf', desc: 'Create PDF documentation', category: 'Export', iconName: 'document' },
  { name: 'Generate SDK', path: '/export/sdk', desc: 'Auto-generate client libraries', category: 'Export', iconName: 'zap' },
  { name: 'Convert OpenAPI', path: '/transform/openapi', desc: 'Convert 2.0 to 3.0 or vice versa', category: 'Transform', iconName: 'convert' },
  { name: 'Convert to GraphQL', path: '/transform/graphql', desc: 'Transform REST to GraphQL schema', category: 'Transform', iconName: 'graphql' },
  { name: 'Convert to TypeScript', path: '/transform/typescript', desc: 'Generate TypeScript types', category: 'Transform', iconName: 'typescript' },
  { name: 'Convert to JSON Schema', path: '/transform/json-schema', desc: 'Extract JSON Schema models', category: 'Transform', iconName: 'file' },
  { name: 'Validate API', path: '/validate', desc: 'Check spec for errors and standards', category: 'Validate', iconName: 'check' },
  { name: 'Test Endpoints', path: '/test', desc: 'Send HTTP requests to test APIs', category: 'Validate', iconName: 'test' },
  { name: 'Generate Tests', path: '/generate-tests', desc: 'Create automated test cases', category: 'Validate', iconName: 'tests' },
  { name: 'Security Audit', path: '/security', desc: 'Scan for security issues', category: 'Validate', iconName: 'lock' },
  { name: 'Generate Docs', path: '/docs', desc: 'Create interactive documentation', category: 'Documentation', iconName: 'book' },
  { name: 'Export Markdown', path: '/docs/markdown', desc: 'Generate Markdown docs', category: 'Documentation', iconName: 'markdown' },
  { name: 'Compare APIs', path: '/compare', desc: 'Diff two API specifications', category: 'Compare', iconName: 'compare' },
  { name: 'Generate Mock Server', path: '/mock', desc: 'Create mock server config', category: 'Mock', iconName: 'database' },
  { name: 'Generate Client', path: '/generate/client', desc: 'Auto-generate client code', category: 'Mock', iconName: 'terminal' },
  { name: 'Generate Server Stubs', path: '/generate/server', desc: 'Create server boilerplate', category: 'Mock', iconName: 'server' },
];

const categories = ['All Tools', 'Analysis', 'Export', 'Transform', 'Validate', 'Documentation', 'Compare', 'Mock'];

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All Tools');

  const filteredTools = selectedCategory === 'All Tools' 
    ? allTools 
    : allTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="home">
      <div className="hero">
        <h1 className="hero-title">work with APIs in one place</h1>
        <p className="hero-subtitle">All tools are 100% FREE and easy to use! Analyze, convert, validate and test APIs with just a few clicks.</p>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="tools-container">
        <div className="tools-grid">
          {filteredTools.map((tool, idx) => (
            <Link key={idx} to={tool.path} className="tool-card">
              <div className="tool-icon">
                <Icon name={tool.iconName} size={48} />
              </div>
              <h3 className="tool-name">{tool.name}</h3>
              <p className="tool-desc">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
