import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process for browser environment and bridge Vite env vars
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Bridge Vite's import.meta.env to process.env if available
// This fixes Vercel deployments where process.env isn't automatically populated
try {
  // @ts-ignore
  if (import.meta && import.meta.env) {
    // @ts-ignore
    const viteEnv = import.meta.env;
    Object.keys(viteEnv).forEach(key => {
        // Map VITE_API_KEY or just API_KEY if exposed
        if (key === 'VITE_API_KEY' || key === 'API_KEY') {
             (window as any).process.env.API_KEY = viteEnv[key];
        }
    });
  }
} catch (e) {
  // Ignore if import.meta is not supported
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch crashes (like missing environment variables or runtime errors)
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#09090b',
          color: '#e4e4e7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f87171' }}>Something went wrong</h2>
          <p style={{ maxWidth: '400px', marginBottom: '2rem', color: '#a1a1aa' }}>
            The application crashed. If you are seeing this on Vercel, it is likely due to a missing API Key or Environment Variable configuration.
          </p>
          <div style={{ 
            backgroundColor: '#18181b', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            fontFamily: 'monospace', 
            fontSize: '0.8rem',
            border: '1px solid #27272a',
            color: '#ef4444'
          }}>
            {this.state.error?.message || "Unknown Error"}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'medium'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);