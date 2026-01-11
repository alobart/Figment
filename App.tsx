import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HistoryStrip } from './components/HistoryStrip';
import { ImageViewer } from './components/ImageViewer';
import { generateImages } from './services/geminiService';
import { GeneratedImage, GenerationParams, StyleOption, ModelOption, ColorPalette, AspectRatio, Lighting, DepthOfField } from './types';
import { Wand2, Loader2, Upload, X, Image as ImageIcon, Menu } from 'lucide-react';

const INITIAL_ANGLE = Math.floor(Math.random() * 360);
const getInitialSeed = (angle: number) => {
    const chaos = Math.sin(angle * 12.9898) * 43758.5453;
    return Math.floor(Math.abs(chaos) * 1000000);
}

const DEFAULT_PARAMS: GenerationParams = {
  prompt: "",
  imageCount: 1,
  seed: getInitialSeed(INITIAL_ANGLE),
  seedAngle: INITIAL_ANGLE,
  useChaosDial: true,
  styleA: StyleOption.CYBERPUNK,
  styleB: StyleOption.REALISTIC,
  matrixPoints: [{ x: 0.5, y: 0.5 }],
  negativePrompts: [],
  uploadedImage: undefined,
  model: ModelOption.FLASH,
  colorPalette: ColorPalette.NONE,
  aspectRatio: AspectRatio.SQUARE,
  lighting: Lighting.NONE,
  depthOfField: DepthOfField.NONE
};

const App: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [params, setParams] = useState<GenerationParams>(DEFAULT_PARAMS);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [currentBatch, setCurrentBatch] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      const newImages: GeneratedImage[] = results.map(res => ({
        id: crypto.randomUUID(),
        url: res.url,
        prompt: generationParams.prompt || "Image Edit",
        timestamp: Date.now(),
        params: generationParams,
        usedPoint: res.point
      }));

      setHistory(prev => [...newImages, ...prev]);
      setCurrentBatch(newImages); 
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleIterate = (image: GeneratedImage) => {
      const randomAngle = Math.floor(Math.random() * 360);
      const chaos = Math.sin(randomAngle * 12.9898) * 43758.5453;
      const newSeed = Math.floor(Math.abs(chaos) * 1000000);

      const iterationParams = { 
          ...image.params, 
          seed: newSeed,
          seedAngle: randomAngle
      };
      setParams(iterationParams);
      handleGenerate(iterationParams);
  };

  const handleUseAsReference = (image: GeneratedImage) => {
      setParams({ ...image.params, uploadedImage: image.url });
      setCurrentBatch([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setParams(prev => ({ ...prev, uploadedImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = () => {
      setParams(prev => ({ ...prev, uploadedImage: undefined }));
  };

  // Prevent white flash by rendering the dark background immediately
  if (!isMounted) {
      return <div className="h-[100dvh] w-full bg-zinc-950" />;
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
                 <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-zinc-900 font-bold shrink-0">
                    N
                 </div>
                 <h1 className="font-bold text-xl tracking-tight hidden sm:block">Nano<span className="text-yellow-400">Studio</span></h1>
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

                    <div className="relative flex items-center gap-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-700 shadow-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all backdrop-blur-md">
                        
                        <label className="p-3 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] flex items-center justify-center" title="Upload Image">
                            <Upload className="w-5 h-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>

                        <textarea
                            value={params.prompt}
                            onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                            placeholder={params.uploadedImage ? "Describe edit..." : "Describe image..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder-zinc-500 resize-none h-12 py-3 leading-relaxed text-base"
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

                    {error && (
                        <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20 animate-in fade-in slide-in-from-bottom-2 font-medium">
                            {error}
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