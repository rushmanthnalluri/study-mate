import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; }

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('StudyMate UI error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[var(--muted)] px-5 py-16 text-[var(--foreground)]">
        <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-100)] text-xl">!</div>
          <h1 className="mt-4 text-xl font-black">StudyMate needs a refresh</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            The current screen encountered an unexpected error. Your account data remains on the server.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-2xl bg-[var(--accent)] px-5 py-3 text-xs font-black text-white hover:bg-[var(--accent-700)]"
          >
            Reload StudyMate
          </button>
        </div>
      </div>
    );
  }
}
