
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ApiKeySelection from './components/ApiKeySelection';
import { GeminiImageService } from './services/geminiService';
import { ImageSize, AspectRatio, GeneratedImage, AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isGenerating: false,
    error: null,
    history: [],
    selectedSize: ImageSize.K1,
    selectedAspectRatio: AspectRatio.SQUARE,
    hasKey: false
  });

  const [isKeyError, setIsKeyError] = useState(false);
  const [prompt, setPrompt] = useState('');
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setState(prev => ({ ...prev, hasKey }));
      }
    };
    checkKey();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    setIsKeyError(false);
    
    try {
      const service = GeminiImageService.getInstance();
      const imageUrl = await service.generateImage(prompt, {
        size: state.selectedSize,
        aspectRatio: state.selectedAspectRatio
      });

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substring(7),
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
        config: {
          size: state.selectedSize,
          aspectRatio: state.selectedAspectRatio
        }
      };

      setState(prev => ({
        ...prev,
        history: [newImage, ...prev.history],
        isGenerating: false
      }));

      // Scroll to top of history
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_RESET_REQUIRED") {
        setIsKeyError(true);
        setState(prev => ({ 
          ...prev, 
          hasKey: false, 
          isGenerating: false, 
          error: "Permission denied. Please ensure your selected API key is from a project with billing enabled." 
        }));
      } else {
        setState(prev => ({ ...prev, error: err.message, isGenerating: false }));
      }
    }
  };

  const handleKeySelected = () => {
    setIsKeyError(false);
    setState(prev => ({ ...prev, hasKey: true }));
  };

  if (!state.hasKey) {
    return <ApiKeySelection onKeySelected={handleKeySelected} isRetry={isKeyError} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fa-solid fa-sliders text-amber-500"></i>
              Parameters
            </h2>

            {/* Resolution Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Image Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ImageSize).map((size) => (
                  <button
                    key={size}
                    onClick={() => setState(prev => ({ ...prev, selectedSize: size }))}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                      state.selectedSize === size
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(AspectRatio).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => setState(prev => ({ ...prev, selectedAspectRatio: value }))}
                    className={`p-2 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${
                      state.selectedAspectRatio === value
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                    title={key}
                  >
                    <div className={`w-4 border-2 border-current rounded-sm ${
                      value === AspectRatio.PORTRAIT ? 'h-6' : 
                      value === AspectRatio.LANDSCAPE ? 'h-3 w-6' : 
                      value === AspectRatio.WIDE ? 'h-2 w-7' : 
                      value === AspectRatio.ULTRAWIDE ? 'h-7 w-2' : 'h-4'
                    }`}></div>
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-zinc-500 mt-1"></i>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Gemini 3 Pro optimized for high-quality artistic rendering and complex scene understanding. 4K generation may take longer.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt History Quick View */}
          <div className="hidden lg:block space-y-4">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">Recent Ideas</h3>
             <div className="space-y-2">
                {["A cyberpunk souq in Neo-Marrakech", "Ancient mechanical golem in a desert oasis", "Abstract calligraphy morphing into a falcon"].map((hint, i) => (
                  <button 
                    key={i}
                    onClick={() => setPrompt(hint)}
                    className="w-full p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 text-left text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all truncate"
                  >
                    {hint}
                  </button>
                ))}
             </div>
          </div>
        </aside>

        {/* Generation & Results Column */}
        <section className="lg:col-span-8 space-y-8 order-1 lg:order-2">
          {/* Input Area */}
          <div className="glass-panel p-2 rounded-[2rem] shadow-2xl shadow-black/50">
            <div className="flex flex-col md:flex-row gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your masterpiece... (e.g., 'A golden library floating above a sea of clouds, cinematic lighting')"
                className="flex-1 bg-transparent p-6 text-lg text-white placeholder-zinc-600 focus:outline-none resize-none h-32 md:h-20"
              />
              <button
                disabled={state.isGenerating || !prompt.trim()}
                onClick={handleGenerate}
                className={`md:w-48 m-2 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
                  state.isGenerating || !prompt.trim()
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/10'
                }`}
              >
                {state.isGenerating ? (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Crafting...
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-sparkles"></i>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {state.error && (
            <div className={`p-4 border rounded-2xl text-sm flex items-center gap-3 ${isKeyError ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <i className={`fa-solid ${isKeyError ? 'fa-key' : 'fa-triangle-exclamation'}`}></i>
              {state.error}
            </div>
          )}

          {/* Results Gallery */}
          <div className="space-y-8" ref={historyRef}>
            {state.isGenerating && (
              <div className="glass-panel p-4 rounded-3xl animate-pulse">
                <div className={`w-full aspect-video bg-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-4 text-zinc-700`}>
                   <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-amber-500 animate-spin"></div>
                   <p className="text-sm font-medium animate-bounce">Consulting the Muses...</p>
                </div>
              </div>
            )}

            {state.history.length === 0 && !state.isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-40">
                <i className="fa-solid fa-palette text-6xl"></i>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Your canvas is empty</h3>
                  <p className="max-w-xs mx-auto text-zinc-400">Enter a prompt above to start generating high-resolution AI art.</p>
                </div>
              </div>
            )}

            {state.history.map((img) => (
              <div key={img.id} className="group glass-panel overflow-hidden rounded-[2.5rem] border-zinc-800/50 hover:border-amber-500/30 transition-all duration-500 shadow-xl">
                <div className="p-2">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-auto rounded-[2rem] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-medium">
                      {img.prompt}
                    </p>
                    <div className="flex gap-2 shrink-0">
                       <button 
                         onClick={() => {
                            const link = document.createElement('a');
                            link.href = img.url;
                            link.download = `al-mamo-${img.id}.png`;
                            link.click();
                         }}
                         className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                         title="Download PNG"
                       >
                         <i className="fa-solid fa-download"></i>
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-zinc-800/50 pt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                      <i className="fa-solid fa-bolt-lightning text-[8px]"></i>
                      {img.config.size}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-800">
                      <i className="fa-solid fa-expand text-[8px]"></i>
                      {img.config.aspectRatio}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-medium ml-auto">
                      {new Date(img.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-zinc-900 mt-20 text-center">
        <p className="text-zinc-600 text-xs font-medium tracking-widest uppercase">
          &copy; 2025 Al-Mamo Pro Imaging • Powered by Gemini 3
        </p>
      </footer>
    </div>
  );
};

export default App;
