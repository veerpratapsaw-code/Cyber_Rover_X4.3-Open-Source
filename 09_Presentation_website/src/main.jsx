import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Crash Caught by ErrorBoundary:', error, errorInfo);
    try {
      fetch('/__client_error', {
        method: 'POST',
        body: 'REACT COMPONENT CRASH: ' + error.toString() + '\n' + (error.stack || '') + '\n' + (errorInfo.componentStack || '')
      });
    } catch(e) {}
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0d12',
          color: '#ff4d4d',
          padding: '40px',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ff4d4d', fontSize: '24px', marginBottom: '16px' }}>
            ⚠️ REACT RUNTIME CRASH DETECTED
          </h1>
          <div style={{
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid #ff4d4d',
            padding: '20px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            marginBottom: '20px'
          }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.error && this.state.error.stack}
            {'\n\nComponent Stack:\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
