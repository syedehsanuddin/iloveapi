import { Link } from 'react-router-dom';
import './ToolLayout.css';

function ToolLayout({ title, description, children }) {
  return (
    <div className="tool-layout">
      <div className="tool-header">
        <Link to="/" className="back-link">
          ← Back to All Tools
        </Link>
        <h1 className="tool-title">{title}</h1>
        <p className="tool-description">{description}</p>
      </div>
      <div className="tool-content">
        {children}
      </div>
    </div>
  );
}

export default ToolLayout;

