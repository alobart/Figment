import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HistoryStrip } from './components/HistoryStrip';
import { ImageViewer } from './components/ImageViewer';
import { TokenFuelGauge } from './components/TokenFuelGauge';
import { MobileView } from './components/MobileView';
import { generateImages, embedPrompt } from './services/geminiService';
import { GeneratedImage, GenerationParams, StyleOption, ModelOption, ColorPalette, AspectRatio, Lighting, DepthOfField } from './types';
import { Wand2, Loader2, Upload, X, Image as ImageIcon, Menu, Key, AlertTriangle, Sparkles } from 'lucide-react';

const DEFAULT_PARAMS: GenerationParams = {
  prompt: "",
  imageCount: 1,
  seed: 12345,
  useCustomSeed: false,
  seedAngle: 0,
  styleA: StyleOption.CYBERPUNK,
  styleB: StyleOption.REALISTIC,
  matrixPoints: [{ x: 0.5, y: 0.5 }],
  negativePrompts: [],
  uploadedImage: undefined,
  model: ModelOption.FLASH,
  colorPalette: ColorPalette.NONE,
  colorCount: 0,
  aspectRatio: AspectRatio.SQUARE,
  lighting: Lighting.NONE,
  depthOfField: DepthOfField.NONE
};

const App: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [params, setParams] = useState<GenerationParams>(DEFAULT_PARAMS);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [currentBatch, setCurrentBatch] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setApiKeyReady(true); // Server handles the key now

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectApiKey = async () => {
      if (window.aistudio) {
          try {
              await window.aistudio.openSelectKey();
              // Race condition mitigation: Assume success immediately after return
              setApiKeyReady(true);
              // Clear previous errors
              setError(null);
          } catch (e) {
              console.error("Failed to select key:", e);
              // Reset if failed
              setApiKeyReady(false);
          }
      }
  };

  const handleGenerate = async (overrideParams?: Partial<GenerationParams>) => {
    const currentParams = { ...params, ...overrideParams };

    if (!currentParams.prompt.trim() && !currentParams.uploadedImage) {
        setError("Please enter a prompt or upload an image.");
        return;
    }

    setIsGenerating(true);
    setError(null);
    if (isSidebarOpen) setIsSidebarOpen(false);

    try {
      // Create a dedicated params object for generation to avoid race conditions with state
      const generationParams = { ...currentParams };
      
      // Update UI state if this was a manual trigger (not an iteration)
      if (!overrideParams) {
          setParams(generationParams);
      }

      const results = await generateImages(generationParams);
      
      if (results.length === 0) {
        throw new Error("No images generated. Please try again.");
      }

      // Generate embedding for the prompt to enable semantic search
      let embedding: number[] | undefined;
      try {
          // We embed the user's prompt (or the full constructed prompt if preferred)
          // Using the user's base prompt is usually better for semantic search intent
          embedding = await embedPrompt(generationParams.prompt || "Image Edit");
      } catch (e) {
          console.error("Failed to generate embedding", e);
      }

      const newImages: GeneratedImage[] = results.map(res => ({
        id: crypto.randomUUID(),
        url: res.url,
        prompt: generationParams.prompt || "Image Edit",
        timestamp: Date.now(),
        params: generationParams,
        usedPoint: res.point,
        embedding
      }));

      setHistory(prev => [...newImages, ...prev]);
      setCurrentBatch(newImages); 
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate image.";
      setError(errorMessage);
      
      // If the error specifically mentions missing key
      if (errorMessage.includes("API Key")) {
         if (window.aistudio) {
             setApiKeyReady(false);
         }
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleIterate = (image: GeneratedImage) => {
      const iterationParams = { ...image.params };
      setParams(iterationParams);
      handleGenerate(iterationParams);
  };

  const handleUseAsReference = (image: GeneratedImage) => {
      setParams({ ...image.params, uploadedImage: image.url });
      setCurrentBatch([]);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setParams(prev => ({ ...prev, uploadedImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const processUrl = async (url: string) => {
    try {
      const trimmed = url.trim();
      if (trimmed.startsWith('data:image/')) {
        setParams(prev => ({ ...prev, uploadedImage: trimmed }));
        return;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return;
      }
      const response = await fetch("/api/fetch-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.dataUrl) {
          setParams(prev => ({ ...prev, uploadedImage: result.dataUrl }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch image from URL:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      let foundFile = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault();
            foundFile = true;
            break;
          }
        }
      }

      if (!foundFile) {
        const text = e.clipboardData?.getData('text/plain');
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          e.preventDefault();
          processUrl(text);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        processFile(file);
        return;
      }

      const uriList = e.dataTransfer?.getData('text/uri-list');
      if (uriList) {
        const url = uriList.split('\n')[0]?.trim();
        if (url) {
          processUrl(url);
          return;
        }
      }

      const text = e.dataTransfer?.getData('text/plain');
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
        processUrl(text);
        return;
      }

      const html = e.dataTransfer?.getData('text/html');
      if (html) {
        const match = html.match(/<img[^>]+src="([^">]+)"/i);
        if (match && match[1]) {
          processUrl(match[1]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const clearUpload = () => {
      setParams(prev => ({ ...prev, uploadedImage: undefined }));
  };

  // Prevent white flash by rendering the dark background immediately
  if (!isMounted) {
      return <div className="h-[100dvh] w-full bg-zinc-950" />;
  }

  // Key Selection Screen (Only for AI Studio Wrapper)
  if (!apiKeyReady && window.aistudio) {
      return (
          <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100 animate-in fade-in duration-500">
                <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                         <Key className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">API Key Required</h1>
                        <p className="text-zinc-400 leading-relaxed">
                            To start creating with Figment, you need to connect a valid Google Cloud API Key.
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleSelectApiKey}
                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                    >
                        <Key className="w-5 h-5" />
                        Select API Key
                    </button>
                    
                    <div className="pt-6 border-t border-zinc-800/50">
                        <p className="text-xs text-zinc-500">
                            By continuing, you agree to use a key from a paid project.<br/>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
                                View Billing Documentation
                            </a>
                        </p>
                    </div>
                </div>
            </div>
      );
  }

  if (isMobile) {
      return (
          <>
            {isDragging && (
              <div className="fixed inset-0 z-[100] bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-indigo-500/50 m-4 rounded-3xl pointer-events-none">
                <div className="bg-zinc-900/90 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
                  <Upload className="w-12 h-12 text-indigo-400 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white mb-2">Drop image here</h3>
                  <p className="text-zinc-400">Use this image as a reference</p>
                </div>
              </div>
            )}
            <MobileView 
                params={params}
                setParams={setParams}
                history={history}
                setHistory={setHistory}
                currentBatch={currentBatch}
                setCurrentBatch={setCurrentBatch}
                isGenerating={isGenerating}
                error={error}
                handleGenerate={handleGenerate}
                handleIterate={handleIterate}
                handleUseAsReference={handleUseAsReference}
                handleFileUpload={handleFileUpload}
                clearUpload={clearUpload}
                apiKeyReady={apiKeyReady}
                handleSelectApiKey={handleSelectApiKey}
            />
          </>
      );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
        />
      )}

      <Sidebar 
        params={params} 
        setParams={setParams} 
        isGenerating={isGenerating}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-indigo-500/50 m-4 rounded-3xl pointer-events-none">
            <div className="bg-zinc-900/90 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
              <Upload className="w-12 h-12 text-indigo-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-2">Drop image here</h3>
              <p className="text-zinc-400">Use this image as a reference</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="h-16 border-b border-zinc-800 flex items-center px-4 md:px-6 justify-between bg-zinc-900/50 backdrop-blur-sm shrink-0 z-10">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                    aria-label="Open settings menu"
                 >
                    <Menu className="w-6 h-6" />
                 </button>
                 <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 fill-white" />
                 </div>
                 <h1 className="font-bold text-xl tracking-tight hidden sm:block text-zinc-100">Figment</h1>
            </div>
            <div className="text-xs text-zinc-500 font-mono hidden md:block">
                Powered by {params.model}
            </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 relative flex flex-col min-h-0">
            
            {/* Loading Overlay */}
            {isGenerating && currentBatch.length === 0 && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <span className="text-sm font-medium text-zinc-300">Dreaming up pixels...</span>
                    </div>
                </div>
            )}

            {currentBatch.length > 0 ? (
                <ImageViewer 
                    images={currentBatch} 
                    onClose={() => setCurrentBatch([])} 
                    onIterate={handleIterate}
                    onUseAsReference={handleUseAsReference}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 shadow-xl shadow-black/20">
                        <ImageIcon className="w-10 h-10 opacity-30" />
                    </div>
                    <h3 className="text-2xl font-semibold text-zinc-200 mb-3 tracking-tight">Ready to Create</h3>
                    <p className="max-w-md text-zinc-500 leading-relaxed text-sm md:text-base">
                        Configure your styles in the sidebar, or simply describe what you want to see below.
                        <br/><span className="text-xs opacity-50 mt-2 block">Try the Style Matrix for advanced blending.</span>
                    </p>
                </div>
            )}

            {/* Prompt Input */}
            <div className="p-4 md:p-6 shrink-0 z-20">
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    
                    {params.uploadedImage && (
                        <div className="relative w-20 h-20 md:w-24 md:h-24 group shrink-0">
                             <img src={params.uploadedImage} className="w-full h-full object-cover rounded-xl border border-indigo-500/50 shadow-lg" alt="Reference" />
                             <button 
                                onClick={clearUpload}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition border border-zinc-900"
                             >
                                <X className="w-3 h-3" />
                             </button>
                             <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none backdrop-blur-sm">
                                <span className="text-[10px] text-white font-medium">Ref</span>
                             </div>
                        </div>
                    )}

                    <div className="relative flex flex-col gap-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-700 shadow-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all backdrop-blur-md">
                        
                        <div className="flex items-start gap-2">
                             <label className="p-3 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] flex items-center justify-center" title="Upload Image">
                                <Upload className="w-5 h-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>

                            <textarea
                                value={params.prompt}
                                onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                                placeholder={params.uploadedImage ? "Describe edit..." : "Describe image..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder-zinc-500 resize-none h-14 md:h-12 py-3 leading-relaxed text-base"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                            />

                            <button
                                onClick={() => handleGenerate()}
                                disabled={isGenerating}
                                className={`p-3 rounded-lg flex items-center gap-2 font-medium transition-all min-h-[44px] ${
                                    isGenerating 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                                }`}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Generate</span>
                                        <Wand2 className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {/* Token Gauge & Footer */}
                        <div className="flex items-center justify-between px-3 pb-1">
                             <TokenFuelGauge params={params} />
                        </div>
                    </div>

                    {error && (
                        <div className={`text-sm p-4 rounded-lg border font-medium flex flex-col gap-2 ${
                            error.includes("API Key") 
                            ? 'bg-amber-500/10 text-amber-200 border-amber-500/20' 
                            : 'bg-red-400/10 text-red-300 border-red-400/20'
                        } animate-in fade-in slide-in-from-bottom-2`}>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {error.includes("API Key") && <AlertTriangle className="w-4 h-4" />}
                                    {error}
                                </span>
                                {/* If error is related to key and in AI Studio, offer button to fix */}
                                {error.includes("API Key") && window.aistudio && (
                                    <button 
                                        onClick={handleSelectApiKey}
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-md transition-colors"
                                    >
                                        Select Key
                                    </button>
                                )}
                            </div>
                            
                            {/* API Key Help Message */}
                            {error.toLowerCase().includes("api key") && !window.aistudio && (
                                <div className="text-xs text-zinc-400 pl-6 border-l-2 border-zinc-700 mt-1">
                                    <span className="font-semibold text-red-400">Environment Configuration Error:</span><br/>
                                    Please ensure <code className="bg-black/30 px-1 rounded text-white">GEMINI_API_KEY</code> is correctly set in your application's environment variables or secrets.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <HistoryStrip 
            images={history} 
            onSelect={(img) => setCurrentBatch([img])}
            onDelete={(id) => {
                setHistory(prev => prev.filter(i => i.id !== id));
                setCurrentBatch(prev => prev.filter(i => i.id !== id));
            }}
            onIterate={handleIterate}
            onUseAsReference={handleUseAsReference}
        />
      </div>
    </div>
  );
};

export default App;