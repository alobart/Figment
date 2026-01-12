import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Ensure global process.env exists
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
  if (!(window as any).process.env) {
    (window as any).process.env = {};
  }
}

// 2. bridge Vite env vars to process.env.API_KEY
// CRITICAL: We must access import.meta.env.VITE_API_KEY directly 
// so the bundler performs static string replacement.
try {
  // @ts-ignore
  const viteKey = import.meta.env.VITE_API_KEY;
  // @ts-ignore
  const standardKey = import.meta.env.API_KEY;
  // @ts-ignore
  const nextKey = import.meta.env.NEXT_PUBLIC_API_KEY;

  const keyToUse = viteKey || standardKey || nextKey;

  if (keyToUse) {
    (window as any).process.env.API_KEY = keyToUse;
  }
} catch (e) {
  // Ignore reference errors if import.meta is not available
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch crashes
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

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