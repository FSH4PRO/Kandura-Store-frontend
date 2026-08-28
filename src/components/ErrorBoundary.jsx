import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

// Class component is required here — React Error Boundaries can't be
// written as hooks/function components (no equivalent lifecycle exists
// yet). Catches render-time errors anywhere below it in the tree so a
// bug in one page can't blank out the entire app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Intentionally console-only — no stack trace or technical detail is
    // ever shown to the user (see render() below).
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl text-midnight-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-midnight-500 mb-6">
            Please refresh the page or try again. If this keeps happening, it isn't your fault —
            we've been notified.
          </p>
          <button className="btn-dark w-full" onClick={this.handleReload}>
            Reload the app
          </button>
        </div>
      </div>
    );
  }
}
