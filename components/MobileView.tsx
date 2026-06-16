import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GeneratedImage, 
  GenerationParams, 
  StyleOption, 
  NEGATIVE_PROMPTS_OPTIONS, 
  ModelOption, 
  ColorPalette, 
  AspectRatio, 
  Lighting, 
  DepthOfField 
} from '../types';
import { 
  Wand2, 
  Sparkles, 
  FolderHeart, 
  Activity, 
  Cpu, 
  BoxSelect, 
  Palette, 
  Droplets, 
  Sun, 
  Aperture, 
  Dices, 
  Sliders, 
  MinusCircle,
  PlusSquare,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  Search,
  BookOpen,
  Trash2,
  Layers,
  LayoutGrid,
  Square,
  Diamond,
  MousePointer2,
  Move,
  MoreHorizontal,
  MoreVertical,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TokenFuelGauge } from './TokenFuelGauge';
import { MatrixPlotter } from './MatrixPlotter';
import { SeedDial } from './SeedDial';
import { ImageViewer } from './ImageViewer';
import { embedPrompt } from '../services/geminiService';

interface MobileViewProps {
  params: GenerationParams;
  setParams: React.Dispatch<React.SetStateAction<GenerationParams>>;
  history: GeneratedImage[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  currentBatch: GeneratedImage[];
  setCurrentBatch: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  isGenerating: boolean;
  error: string | null;
  handleGenerate: (overrideParams?: Partial<GenerationParams>) => Promise<void>;
  handleIterate: (image: GeneratedImage) => void;
  handleUseAsReference: (image: GeneratedImage) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearUpload: () => void;
  apiKeyReady: boolean;
  handleSelectApiKey: () => Promise<void>;
}

// Helper to calculate cosine similarity
const cosineSimilarity = (a: number[], b: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const COLOR_COUNTS = [0, 2, 3, 4, 5, 8, 16, 32, 64, 128, 256];

export const MobileView: React.FC<MobileViewProps> = ({
  params,
  setParams,
  history,
  setHistory,
  currentBatch,
  setCurrentBatch,
  isGenerating,
  error,
  handleGenerate,
  handleIterate,
  handleUseAsReference,
  handleFileUpload,
  clearUpload,
  apiKeyReady,
  handleSelectApiKey
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'canvas' | 'gallery'>('create');
  
  // Collapse states for Create settings sections to save mobile screen real estate
  const [expandedSection, setExpandedSection] = useState<string | null>('matrix');
  
  // Gallery search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([]);

  // Style Matrix help mode
  const [activePattern, setActivePattern] = useState<'free' | 'vertical' | 'horizontal'>('free');
  const [matrixSpacing, setMatrixSpacing] = useState(0.5);

  // Sync gallery filtered images
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredImages(history.slice().reverse());
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const queryEmbedding = await embedPrompt(searchQuery);
        if (queryEmbedding.length === 0) {
          setFilteredImages(history.filter(img => img.prompt.toLowerCase().includes(searchQuery.toLowerCase())).reverse());
          return;
        }

        const scoredImages = history.map(img => {
          let score = 0;
          if (img.embedding && img.embedding.length > 0) {
            score = cosineSimilarity(queryEmbedding, img.embedding);
          } else {
            score = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.5 : 0;
          }
          return { img, score };
        });

        const sorted = scoredImages
          .filter(item => item.score > 0.4)
          .sort((a, b) => b.score - a.score)
          .map(item => item.img);

        setFilteredImages(sorted);
      } catch (e) {
        console.error(e);
        setFilteredImages(history.filter(img => img.prompt.toLowerCase().includes(searchQuery.toLowerCase())).reverse());
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, history]);

  // When generating starts, auto-switch to "canvas" tab to show active progress
  useEffect(() => {
    if (isGenerating) {
      setActiveTab('canvas');
    }
  }, [isGenerating]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const selectStyle = (key: 'styleA' | 'styleB', val: string) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  const handleStylePreset = (type: 'single' | 'corners' | 'diamond' | 'grid' | 'free4' | 'vertical' | 'horizontal') => {
    let newPoints = params.matrixPoints;
    let newMode: 'free' | 'vertical' | 'horizontal' = 'free';

    switch (type) {
        case 'single': newPoints = [{ x: 0, y: 0 }]; break;
        case 'corners': newPoints = [{ x: -0.9, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: -0.9, y: -0.9 }, { x: 0.9, y: -0.9 }]; break;
        case 'diamond': newPoints = [{ x: 0, y: 0.9 }, { x: 0.9, y: 0 }, { x: 0, y: -0.9 }, { x: -0.9, y: 0 }]; break;
        case 'grid': newPoints = [{ x: 0, y: 0 }, { x: 0.8, y: 0.8 }, { x: -0.8, y: 0.8 }, { x: 0.8, y: -0.8 }, { x: -0.8, y: -0.8 }]; break;
        case 'free4': newPoints = [{ x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }]; break;
        case 'vertical':
            newMode = 'vertical';
            newPoints = [
                { x: 0, y: matrixSpacing },
                { x: 0, y: 0 },
                { x: 0, y: -matrixSpacing }
            ];
            break;
        case 'horizontal':
            newMode = 'horizontal';
            newPoints = [
                { x: -matrixSpacing, y: 0 },
                { x: 0, y: 0 },
                { x: matrixSpacing, y: 0 }
            ];
            break;
    }
    setActivePattern(newMode);
    setParams(prev => ({ ...prev, matrixPoints: newPoints }));
  };

  const handleSpacingChangeMobile = (newSpacing: number) => {
    setMatrixSpacing(newSpacing);
    if (activePattern === 'vertical' || activePattern === 'horizontal') {
        setParams(prev => {
            const points = prev.matrixPoints;
            if (points.length === 0) return prev;
            const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
            const count = points.length;
            const newPoints = points.map((_, idx) => {
                const offset = (idx - (count - 1) / 2) * newSpacing;
                if (activePattern === 'vertical') {
                     return { x: parseFloat(cx.toFixed(2)), y: parseFloat((cy - offset).toFixed(2)) };
                } else {
                     return { x: parseFloat((cx + offset).toFixed(2)), y: parseFloat(cy.toFixed(2)) };
                }
            });
            const clamped = newPoints.map(p => ({
                x: Math.max(-1, Math.min(1, p.x)),
                y: Math.max(-1, Math.min(1, p.y))
            }));
            return { ...prev, matrixPoints: clamped };
        });
    }
  };

  const toggleNegative = (opt: string) => {
    setParams(prev => {
      const current = prev.negativePrompts;
      return { 
        ...prev, 
        negativePrompts: current.includes(opt) 
          ? current.filter(o => o !== opt) 
          : [...current, opt] 
      };
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      
      {/* Sleek Mobile Header */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Figment
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
            v1.1
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          {activeTab === 'create' ? 'Studio Mode' : activeTab === 'canvas' ? 'Active view' : 'Library'}
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <motion.div 
              key="create" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-4 space-y-6 pb-28">
                
                {/* Visual Feedback Warning */}
                {error && (
                  <div className="p-3.5 bg-red-500/15 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                      {error.toLowerCase().includes("api key") && !window.aistudio && (
                        <p className="opacity-70 mt-1">Please ensure GEMINI_API_KEY environment variable is configured in settings or secrets.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Prompt Section */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Prompt Input</span>
                  <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-2 focus-within:border-indigo-500/60 transition-all shadow-lg">
                    {params.uploadedImage && (
                      <div className="flex items-center gap-2 mb-2 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                        <img src={params.uploadedImage} className="w-10 h-10 object-cover rounded-lg border border-indigo-500/40" alt="Reference" />
                        <span className="text-xs text-zinc-400 flex-1 truncate">Image Reference Active</span>
                        <button onClick={clearUpload} className="p-1.5 bg-red-500/20 text-red-400 hover:text-red-300 rounded-full transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <label className="p-3 bg-zinc-800/30 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer min-h-[44px] flex items-center justify-center border border-zinc-800/60 shrink-0">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </label>
                      
                      <textarea
                        value={params.prompt}
                        onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                        placeholder={params.uploadedImage ? "Describe reference modifications..." : "A hyperdetailed, cinematic masterpiece of..."}
                        className="flex-1 bg-transparent border-0 ring-0 focus:outline-none focus:ring-0 text-sm py-2 leading-relaxed h-20 text-zinc-100 placeholder-zinc-600 resize-none"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 px-1 pb-1">
                      <TokenFuelGauge params={params} />
                    </div>
                  </div>
                </div>

                {/* Collapsible Options Container */}
                <div className="space-y-3">
                  
                  {/* Option: Style Matrix */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/40">
                    <button 
                      onClick={() => toggleSection('matrix')}
                      className="w-full px-4 py-3.5 flex items-center justify-between bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-zinc-200">Style Blending Matrix</span>
                      </div>
                      {expandedSection === 'matrix' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'matrix' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-zinc-900/50"
                        >
                          <div className="p-4 space-y-4">
                            
                            {/* Selected Styles Row */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Horizontal (Style A)</label>
                                <select 
                                  value={params.styleA}
                                  onChange={(e) => selectStyle('styleA', e.target.value)}
                                  className="w-full bg-zinc-950 text-xs text-zinc-300 p-2.5 rounded-lg border border-zinc-800/80 outline-none focus:border-indigo-500"
                                >
                                  {Object.values(StyleOption).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Vertical (Style B)</label>
                                <select 
                                  value={params.styleB}
                                  onChange={(e) => selectStyle('styleB', e.target.value)}
                                  className="w-full bg-zinc-950 text-xs text-zinc-300 p-2.5 rounded-lg border border-zinc-800/80 outline-none focus:border-indigo-500"
                                >
                                  {Object.values(StyleOption).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>

                            {/* The Plotter itself (perfectly fits mobile) */}
                            <div className="max-w-xs mx-auto">
                              <MatrixPlotter 
                                points={params.matrixPoints}
                                onChange={(pts) => setParams(prev => ({ ...prev, matrixPoints: pts }))}
                                labelX={params.styleA}
                                labelY={params.styleB}
                                mode={activePattern}
                              />
                            </div>

                            {/* Presets */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Matrix Layout Patterns</span>
                              <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => handleStylePreset('single')} className="p-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800/60 text-zinc-400 hover:text-white flex items-center justify-center text-xs gap-1.5">
                                  <MousePointer2 className="w-3.5 h-3.5 text-indigo-400" />
                                  Single
                                </button>
                                <button onClick={() => handleStylePreset('corners')} className="p-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800/60 text-zinc-400 hover:text-white flex items-center justify-center text-xs gap-1.5">
                                  <Square className="w-3.5 h-3.5 text-indigo-400" />
                                  Corners
                                </button>
                                <button onClick={() => handleStylePreset('diamond')} className="p-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800/60 text-zinc-400 hover:text-white flex items-center justify-center text-xs gap-1.5">
                                  <Diamond className="w-3.5 h-3.5 text-indigo-400" />
                                  Diamond
                                </button>
                                <button onClick={() => handleStylePreset('grid')} className="p-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800/60 text-zinc-400 hover:text-white flex items-center justify-center text-xs gap-1.5">
                                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                                  Grid
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Option: Aspect Ratio & Model Selection */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/40">
                    <button 
                      onClick={() => toggleSection('ratio')}
                      className="w-full px-4 py-3.5 flex items-center justify-between bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BoxSelect className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold text-zinc-200">Dimensions & Engine</span>
                      </div>
                      {expandedSection === 'ratio' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'ratio' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-zinc-900/50"
                        >
                          <div className="p-4 space-y-4">
                            
                            {/* Models Pill Selection */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-zinc-400">AI Rendering Model</span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => setParams(prev => ({ ...prev, model: ModelOption.FLASH }))}
                                  className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                                    params.model === ModelOption.FLASH 
                                      ? 'bg-zinc-850 border-indigo-500/70 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                                      : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                                  }`}
                                >
                                  Gemini 2.5 Flash
                                </button>
                                <button
                                  onClick={() => setParams(prev => ({ ...prev, model: ModelOption.PRO }))}
                                  className={`p-2.5 text-xs rounded-xl border text-center transition-all ${
                                    params.model === ModelOption.PRO 
                                      ? 'bg-zinc-850 border-indigo-500/70 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                                      : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                                  }`}
                                >
                                  Gemini 3.1 Flash (Preview)
                                </button>
                              </div>
                            </div>

                            {/* Aspect Ratio Cards Grid */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-semibold text-zinc-400">Target Aspect Ratio</span>
                              <div className="grid grid-cols-3 gap-2">
                                {Object.values(AspectRatio).map((ratio) => (
                                  <button
                                    key={ratio}
                                    onClick={() => setParams(prev => ({ ...prev, aspectRatio: ratio }))}
                                    className={`p-2 text-xs rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                                      params.aspectRatio === ratio
                                        ? 'bg-zinc-850 border-indigo-500/70 text-indigo-400 shadow-lg shadow-indigo-500/10'
                                        : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                                    }`}
                                  >
                                    <div className={`border rounded bg-zinc-950/20 shadow-inner flex items-center justify-center opacity-65 ${
                                      ratio === AspectRatio.SQUARE ? 'w-4 h-4' :
                                      ratio === AspectRatio.LANDSCAPE ? 'w-6 h-3.5' :
                                      ratio === AspectRatio.PORTRAIT ? 'w-3.5 h-6' :
                                      ratio === AspectRatio.WIDE ? 'w-3.5 h-5' : 'w-5 h-3.5'
                                    }`} />
                                    <span>{ratio === AspectRatio.SQUARE ? '1:1 Square' :
                                          ratio === AspectRatio.LANDSCAPE ? '16:9 Wide' :
                                          ratio === AspectRatio.PORTRAIT ? '9:16 Tall' :
                                          ratio === AspectRatio.WIDE ? '3:4 Portrait' : '4:3 Classic'}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Option: Artistic Modifiers (Lighting, Palette, Focus) */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/40">
                    <button 
                      onClick={() => toggleSection('art')}
                      className="w-full px-4 py-3.5 flex items-center justify-between bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-zinc-200">Artistic Finetuning</span>
                      </div>
                      {expandedSection === 'art' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'art' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-zinc-900/50"
                        >
                          <div className="p-4 space-y-4">
                            
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-400">Color Palette Limit</label>
                              <select 
                                value={params.colorPalette}
                                onChange={(e) => setParams(prev => ({ ...prev, colorPalette: e.target.value as ColorPalette }))}
                                className="w-full bg-zinc-950 text-xs text-zinc-300 p-2.5 rounded-xl border border-zinc-805/80 outline-none"
                              >
                                {Object.values(ColorPalette).map(palette => (
                                  <option key={palette} value={palette}>{palette}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-400">Lighting & Glow</label>
                              <select 
                                value={params.lighting}
                                onChange={(e) => setParams(prev => ({ ...prev, lighting: e.target.value as Lighting }))}
                                className="w-full bg-zinc-950 text-xs text-zinc-300 p-2.5 rounded-xl border border-zinc-805/80 outline-none"
                              >
                                {Object.values(Lighting).map(l => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-400">Focal Depth (DOF)</label>
                              <select 
                                value={params.depthOfField}
                                onChange={(e) => setParams(prev => ({ ...prev, depthOfField: e.target.value as DepthOfField }))}
                                className="w-full bg-zinc-950 text-xs text-zinc-300 p-2.5 rounded-xl border border-zinc-805/80 outline-none"
                              >
                                <option value={DepthOfField.NONE}>Default depth</option>
                                <option value={DepthOfField.SHALLOW}>Cinematic Bokeh/Shallow</option>
                                <option value={DepthOfField.DEEP}>Deep / Crisp Detail</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Option: Seed & Parameters */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/40">
                    <button 
                      onClick={() => toggleSection('seed')}
                      className="w-full px-4 py-3.5 flex items-center justify-between bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Dices className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-zinc-200">Latent Seeds & Counters</span>
                      </div>
                      {expandedSection === 'seed' ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSection === 'seed' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-zinc-900/50"
                        >
                          <div className="p-4 space-y-4">
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-400">Lock Custom Seed</span>
                              <button 
                                onClick={() => setParams(prev => ({ ...prev, useCustomSeed: !prev.useCustomSeed }))}
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                                  params.useCustomSeed ? 'bg-indigo-600' : 'bg-zinc-800'
                                }`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                  params.useCustomSeed ? 'translate-x-4' : 'translate-x-0'
                                }`} />
                              </button>
                            </div>

                            {params.useCustomSeed && (
                              <div className="animate-in fade-in zoom-in-95">
                                <SeedDial 
                                  angle={params.seedAngle}
                                  seed={params.seed}
                                  onChange={(angle, seed) => setParams(prev => ({ ...prev, seedAngle: angle, seed }))}
                                />
                                <div className="text-center font-mono text-[10px] text-zinc-500 mt-2">Active Seed Lock: {params.seed}</div>
                              </div>
                            )}

                            {/* Image Count - only visible when not doing matrix rendering */}
                            {params.matrixPoints.length <= 1 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                  <span>Image Batch Count</span>
                                  <span className="text-indigo-400 font-mono font-bold">{params.imageCount}</span>
                                </div>
                                <input 
                                  type="range"
                                  min="1"
                                  max="4"
                                  step="1"
                                  value={params.imageCount}
                                  onChange={(e) => setParams(prev => ({ ...prev, imageCount: parseInt(e.target.value) }))}
                                  className="w-full accent-indigo-500 h-8 bg-transparent"
                                />
                              </div>
                            )}

                            {/* Negative Filters */}
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-zinc-405 block">Negative Filters</span>
                              <div className="flex flex-wrap gap-1.5">
                                {NEGATIVE_PROMPTS_OPTIONS.map(opt => {
                                  const isChecked = params.negativePrompts.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => toggleNegative(opt)}
                                      className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all ${
                                        isChecked 
                                          ? 'bg-red-500/20 border-red-500/40 text-red-300' 
                                          : 'bg-zinc-950 border-zinc-900 text-zinc-550'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* Main Submit Button (Float/Sticky Bottom) */}
              <div className="fixed bottom-14 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-30 shrink-0">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || (!params.prompt.trim() && !params.uploadedImage)}
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-xl text-sm md:text-base ${
                    isGenerating || (!params.prompt.trim() && !params.uploadedImage)
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-800/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-indigo-600/20'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Brewing Creative Latents...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Pixels</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          )}

          {/* CANVAS / VIEW ACTIVE TAB */}
          {activeTab === 'canvas' && (
            <motion.div 
              key="canvas" 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col justify-center items-center relative overflow-hidden"
            >
              {isGenerating && currentBatch.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400 font-mono">Bending style dimensions...</span>
                </div>
              ) : currentBatch.length > 0 ? (
                <ImageViewer 
                  images={currentBatch}
                  onClose={() => setCurrentBatch([])}
                  onIterate={(img) => {
                    handleIterate(img);
                    setActiveTab('canvas');
                  }}
                  onUseAsReference={(img) => {
                    handleUseAsReference(img);
                    setActiveTab('create');
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-xs">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-805 rounded-2xl flex items-center justify-center opacity-40 shadow-inner">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300">Active Stage Empty</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Write a prompt in the Create studio, or choose an existing design from the Gallery below to tweak.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs rounded-lg text-zinc-300 hover:text-white"
                  >
                    Enter Creative Lab
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col overflow-hidden"
            >
              
              {/* Semantic Search Area */}
              <div className="p-4 bg-zinc-950/50 border-b border-zinc-90 w-full shrink-0 space-y-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Historical Library ({history.length})</span>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query matching style/mood..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-indigo-500 text-xs py-2.5 rounded-xl pl-9 pr-9"
                  />
                  {isSearching && <Loader2 className="w-3.5 h-3.5 absolute right-3.5 text-indigo-400 animate-spin" />}
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-4 pb-20">
                {filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 mt-12 opacity-60">
                    <FolderHeart className="w-8 h-8 text-zinc-600" />
                    <p className="text-xs text-zinc-550 max-w-xs leading-relaxed">
                      {searchQuery ? "No matching records found. Try other keywords." : "You haven’t rendered any concepts yet! Generate to populate this wall."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {filteredImages.map(img => (
                      <div 
                        key={img.id}
                        onClick={() => {
                          setCurrentBatch([img]);
                          setActiveTab('canvas');
                        }}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-lg active:scale-95 transition-all text-left"
                      >
                        <img src={img.url} className="w-full h-full object-cover" alt={img.prompt} />
                        
                        {/* Compact coordinate overlay */}
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/5 text-[9px] text-zinc-400 font-mono scale-90">
                          X:{img.usedPoint.x}, Y:{img.usedPoint.y}
                        </div>

                        {/* Prompt hint at details */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2">
                          <p className="text-[10px] text-zinc-300 font-medium truncate">{img.prompt}</p>
                          <p className="text-[8px] text-indigo-400 truncate mt-0.5">{img.params.styleA} × {img.params.styleB}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav bar */}
      <nav className="h-14 border-t border-zinc-900 bg-zinc-950/85 backdrop-blur-md flex items-center justify-around px-2 shrink-0 sticky bottom-0 z-40">
        
        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'create' ? 'text-indigo-400 font-medium scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
            activeTab === 'canvas' ? 'text-indigo-400 font-medium scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Active</span>
          {currentBatch.length > 0 && (
            <div className="absolute top-1.5 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'gallery' ? 'text-indigo-400 font-medium scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FolderHeart className="w-5 h-5" />
          <span className="text-[9px] tracking-wide">Library</span>
        </button>

      </nav>

    </div>
  );
};
