import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import ExportPostman from './pages/tools/ExportPostman';
import ExportInsomnia from './pages/tools/ExportInsomnia';
import ExportCurl from './pages/tools/ExportCurl';
import ExportCodeSnippets from './pages/tools/ExportCodeSnippets';
import ExportPDF from './pages/tools/ExportPDF';
import GenerateSDK from './pages/tools/GenerateSDK';
import ConvertOpenAPI from './pages/tools/ConvertOpenAPI';
import ConvertGraphQL from './pages/tools/ConvertGraphQL';
import ConvertTypeScript from './pages/tools/ConvertTypeScript';
import ConvertJSONSchema from './pages/tools/ConvertJSONSchema';
import ValidateAPI from './pages/tools/ValidateAPI';
import TestEndpoints from './pages/tools/TestEndpoints';
import GenerateTests from './pages/tools/GenerateTests';
import SecurityAudit from './pages/tools/SecurityAudit';
import GenerateDocs from './pages/tools/GenerateDocs';
import GenerateMarkdown from './pages/tools/GenerateMarkdown';
import DependencyGraph from './pages/tools/DependencyGraph';
import MethodDistribution from './pages/tools/MethodDistribution';
import ParameterAnalysis from './pages/tools/ParameterAnalysis';
import ComplexityScore from './pages/tools/ComplexityScore';
import CompareAPIs from './pages/tools/CompareAPIs';
import GenerateMock from './pages/tools/GenerateMock';
import GenerateClient from './pages/tools/GenerateClient';
import GenerateServerStubs from './pages/tools/GenerateServerStubs';
import { trackVisit } from './utils/trafficTracker';
import './App.css';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">API Tools</span>
        </Link>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Track page visits
    trackVisit(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analyzer" element={<Analyzer />} />
      <Route path="/export/postman" element={<ExportPostman />} />
      <Route path="/export/insomnia" element={<ExportInsomnia />} />
      <Route path="/export/curl" element={<ExportCurl />} />
      <Route path="/export/code-snippets" element={<ExportCodeSnippets />} />
      <Route path="/export/pdf" element={<ExportPDF />} />
      <Route path="/export/sdk" element={<GenerateSDK />} />
      <Route path="/transform/openapi" element={<ConvertOpenAPI />} />
      <Route path="/transform/graphql" element={<ConvertGraphQL />} />
      <Route path="/transform/typescript" element={<ConvertTypeScript />} />
      <Route path="/transform/json-schema" element={<ConvertJSONSchema />} />
      <Route path="/validate" element={<ValidateAPI />} />
      <Route path="/test" element={<TestEndpoints />} />
      <Route path="/generate-tests" element={<GenerateTests />} />
      <Route path="/security" element={<SecurityAudit />} />
      <Route path="/docs" element={<GenerateDocs />} />
      <Route path="/docs/markdown" element={<GenerateMarkdown />} />
      <Route path="/analyze/dependency-graph" element={<DependencyGraph />} />
      <Route path="/analyze/method-distribution" element={<MethodDistribution />} />
      <Route path="/analyze/parameters" element={<ParameterAnalysis />} />
      <Route path="/analyze/complexity" element={<ComplexityScore />} />
      <Route path="/compare" element={<CompareAPIs />} />
      <Route path="/mock" element={<GenerateMock />} />
      <Route path="/generate/client" element={<GenerateClient />} />
      <Route path="/generate/server" element={<GenerateServerStubs />} />
    </Routes>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <p className="footer-text">
        For improvements Email to <a href="mailto:syed.ahsan934@gmail.com" className="footer-link">syed.ahsan934@gmail.com</a>
      </p>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <AppContent />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
