import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process for browser environment and bridge Vite env vars
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!process.env) {
  (process as any).env = {};
}

// Bridge Vite's import.meta.env to process.env
// This handles Vercel deployments where variables must be prefixed with VITE_
try {
  // @ts-ignore
  if (import.meta && import.meta.env) {
    // @ts-ignore
    const viteEnv = import.meta.env;
    
    // 1. Try explicit lookup (safest for static replacement in some builds)
    const explicitKey = viteEnv.VITE_API_KEY || viteEnv.NEXT_PUBLIC_API_KEY || viteEnv.REACT_APP_API_KEY || viteEnv.API_KEY;
    
    if (explicitKey) {
        (window as any).process.env.API_KEY = explicitKey;
    } else {
        // 2. Fallback to iteration
        Object.keys(viteEnv).forEach(key => {
            if (key === 'VITE_API_KEY' || key === 'API_KEY' || key === 'NEXT_PUBLIC_API_KEY') {
                (window as any).process.env.API_KEY = viteEnv[key];
            }
        });
    }
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

// Error Boundary to catch crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
            The application crashed. Please check your console for details.
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