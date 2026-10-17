import { Component } from "react";

// A render error shows a way out instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ui]", error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    const chunk = /dynamically imported module|Loading chunk|Failed to fetch/i.test(String(this.state.error?.message));
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h1 className="text-3xl font-bold">{chunk ? "A new version is available" : "This page hit a problem"}</h1>
        <p className="mt-3 text-ink-2">
          {chunk ? "The site was updated while you had it open. Reload to get the latest version." : "Your saved results are safe. Reload the page, or go back to the start."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
          <a className="btn btn-quiet" href="/">Go to the home page</a>
        </div>
      </div>
    );
  }
}
