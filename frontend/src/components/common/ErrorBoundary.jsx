import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    // Log to error reporting service here if needed
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              We're sorry, but something unexpected happened. Please try reloading the page or go back to the homepage.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReload}
                  icon={<RefreshCw className="h-4 w-4" />}
                  variant="primary"
                >
                  Reload Page
                </Button>

                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  icon={<Home className="h-4 w-4" />}
                >
                  Go Home
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                size="small"
              >
                Go Back
              </Button>
            </div>

            {isDev && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-red-400 font-semibold mb-4">
                  Error Details (Dev Mode Only)
                </summary>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-left">
                  <div className="mb-4">
                    <h4 className="text-red-300 font-semibold mb-2">Error Message:</h4>
                    <pre className="text-sm text-red-300 whitespace-pre-wrap overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-red-300 font-semibold mb-2">Component Stack:</h4>
                      <pre className="text-sm text-red-300 whitespace-pre-wrap overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <p className="text-xs text-gray-500 mt-6">
              Error ID: {this.state.eventId || 'N/A'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
