'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-black text-black font-mono mb-4">
              Something went wrong
            </h1>
            <p className="text-black font-medium mb-4">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 