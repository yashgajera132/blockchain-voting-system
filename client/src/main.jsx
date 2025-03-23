import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import { Web3Provider } from './context/Web3Context.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Add preloading hints for better performance
const addPerformanceHints = () => {
  // Add preconnect for API server
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const linkEl = document.createElement('link');
  linkEl.rel = 'preconnect';
  linkEl.href = apiUrl;
  document.head.appendChild(linkEl);
  
  // Prefetch critical assets
  const prefetchLinks = [
    '/logo.png',
    '/favicon.ico'
  ];
  
  prefetchLinks.forEach(link => {
    const prefetchEl = document.createElement('link');
    prefetchEl.rel = 'prefetch';
    prefetchEl.href = link;
    document.head.appendChild(prefetchEl);
  });
};

// Add a global function to check auth status across the application
window.checkAuthState = () => {
  // Get user data from localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    console.warn('No authentication data found in localStorage');
    return null;
  }
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

// Call the function before rendering the app
addPerformanceHints();

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-center text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              The application encountered an error. Please try refreshing the page or check your wallet connection.
            </p>
            <div className="text-sm bg-gray-100 p-3 rounded mb-6 overflow-auto max-h-32">
              <code className="text-red-600">{this.state.error?.message || "Unknown error"}</code>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Web3Provider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#ffffff',
                  color: '#333333',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
