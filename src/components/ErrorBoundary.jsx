import { Component } from "react";
import { LogoMark } from "./ui";

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
      <div className="mx-auto grid max-w-lg place-items-center py-16 text-center" role="alert">
        <LogoMark size={56} />
        <h1 className="mt-8 text-[2.25rem] sm:text-5xl">{chunk ? "A new version is available" : "This page hit a problem"}</h1>
        <p className="lead mt-4">
          {chunk ? "The site was updated while you had it open. Reload to get the latest version." : "Your saved results are safe. Reload the page, or go back to the start."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
          <a className="btn btn-ghost" href="/">Go to the home page</a>
        </div>
      </div>
    );
  }
}
