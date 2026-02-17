
import React from 'react';

interface ApiKeySelectionProps {
  onKeySelected: () => void;
  isRetry?: boolean;
}

const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onKeySelected, isRetry }) => {
  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Per instructions, assume success and proceed to the app immediately
      onKeySelected();
    } else {
      alert("AI Studio environment not detected.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border ${isRetry ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <i className={`fa-solid ${isRetry ? 'fa-triangle-exclamation text-red-500' : 'fa-key text-amber-500'} text-3xl`}></i>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Al-Mamo <span className="text-amber-500">Pro</span>
          </h1>
          {isRetry ? (
            <div className="space-y-3">
              <p className="text-red-400 font-semibold">Permission Required</p>
              <p className="text-zinc-400 text-sm">
                The high-quality <code className="bg-zinc-900 px-1 rounded text-amber-500">Pro</code> model requires an API key from a <strong>paid Google Cloud project</strong> with billing enabled.
              </p>
            </div>
          ) : (
            <p className="text-zinc-400">
              Generating high-fidelity 1K, 2K, and 4K images requires a valid API key from a professional project with billing enabled.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleOpenSelectKey}
            className={`w-full py-4 px-6 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isRetry ? 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-xl shadow-amber-500/5'
            }`}
          >
            <i className="fa-solid fa-shield-halved"></i>
            {isRetry ? 'Select New Paid API Key' : 'Select API Key'}
          </button>
          
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-zinc-500 hover:text-amber-500 transition-colors"
          >
            Learn about API billing & documentation
            <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelection;
