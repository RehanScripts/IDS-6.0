import React from 'react';

export default function AIInterviewPage() {
  const openInterview = () => {
    window.dispatchEvent(new CustomEvent('mock-interview:open'));
  };

  const openFullScreen = () => {
    window.dispatchEvent(new CustomEvent('mock-interview:fullscreen', { detail: { enabled: true } }));
  };

  const minimizeInterview = () => {
    window.dispatchEvent(new CustomEvent('mock-interview:minimize'));
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 p-6 md:p-8" data-testid="ai-interview-page">
      <h1 className="text-4xl font-semibold text-emerald-950 tracking-tight" style={{ fontFamily: 'Outfit' }}>
        AI Interview
      </h1>
      <p className="text-emerald-900/75 mt-2 text-sm md:text-base">
        Open the interview panel, switch to full screen when needed, or minimize it without losing sidebar navigation.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openInterview}
          className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800"
        >
          Open AI Interview
        </button>
        <button
          type="button"
          onClick={openFullScreen}
          className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-800 text-sm font-medium hover:bg-emerald-100"
        >
          Full Screen
        </button>
        <button
          type="button"
          onClick={minimizeInterview}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100"
        >
          Minimize
        </button>
      </div>
    </div>
  );
}
