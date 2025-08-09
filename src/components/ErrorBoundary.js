"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {}

  reset() {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === "function") {
      try {
        this.props.onReset();
      } catch {}
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      if (fallback) return fallback;
      return (
        <div className="w-full py-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong.</h2>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

