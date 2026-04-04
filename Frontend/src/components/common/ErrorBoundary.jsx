import { Component } from "react";
import Button from "../ui/Button.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to error tracking service in production
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😵</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            {/* Show error in development */}
            {import.meta.env.DEV && (
              <pre className="text-xs text-left bg-gray-100 p-4 rounded-lg mb-6 overflow-auto max-h-40 text-red-600">
                {this.state.error?.toString()}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;