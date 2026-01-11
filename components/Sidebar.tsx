import React from 'react';
import { GenerationParams, StyleOption, NEGATIVE_PROMPTS_OPTIONS, Point, ModelOption, ColorPalette, AspectRatio, Lighting, DepthOfField } from '../types';
import { Settings2, MinusCircle, Sliders, LayoutGrid, Square, Diamond, MousePointer2, Move, Palette, Cpu, X, BoxSelect, Sun, Aperture, Zap, RefreshCw } from 'lucide-react';
import { MatrixPlotter } from './MatrixPlotter';
import { SeedDial } from './SeedDial';

interface SidebarProps {
  params: GenerationParams;
  setParams: React.Dispatch<React.SetStateAction<GenerationParams>>;
  isGenerating: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ params, setParams, isGenerating, isOpen, onClose }) => {
  
  const handleStyleChange = (key: 'styleA' | 'styleB', value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const toggleNegativePrompt = (option: string) => {
    setParams(prev => {
      const current = prev.negativePrompts;
      if (current.includes(option)) {
        return { ...prev, negativePrompts: current.filter(o => o !== option) };
      } else {
        return { ...prev, negativePrompts: [...current, option] };
      }
    });
  };

  const setMatrixPattern = (type: 'single' | 'corners' | 'diamond' | 'grid' | 'free4') => {
      let newPoints: Point[] = [];
      switch (type) {
          case 'single': newPoints = [{ x: 0, y: 0 }]; break;
          case 'corners': newPoints = [{ x: -0.9, y: 0.9 }, { x: 0.9, y: 0.9 }, { x: -0.9, y: -0.9 }, { x: 0.9, y: -0.9 }]; break;
          case 'diamond': newPoints = [{ x: 0, y: 0.9 }, { x: 0.9, y: 0 }, { x: 0, y: -0.9 }, { x: -0.9, y: 0 }]; break;
          case 'grid': newPoints = [{ x: 0, y: 0 }, { x: 0.8, y: 0.8 }, { x: -0.8, y: 0.8 }, { x: 0.8, y: -0.8 }, { x: -0.8, y: -0.8 }]; break;
          case 'free4': newPoints = [{ x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }]; break;
      }
      setParams(prev => ({ ...prev, matrixPoints: newPoints }));
  };

  const isMultiPoint = params.matrixPoints.length > 1;

  return (
    <div className={`
        fixed inset-y-0 left-0 z-50 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto p-4
        w-full max-w-sm transform transition-transform duration-300 ease-in-out
        md:static md:w-80 md:shrink-0 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-6 min-h-[44px]">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Configuration</h2>
        </div>
        <button 
            onClick={onClose} 
            className="md:hidden p-3 -mr-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors" 
            aria-label="Close settings"
        >
            <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6 pb-20 md:pb-0">

        {/* Model Selection */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Cpu className="w-4 h-4 text-blue-400" />
                AI Model
            </div>
            <select
                value={params.model}
                onChange={(e) => setParams(prev => ({ ...prev, model: e.target.value as ModelOption }))}
                className="w-full bg-zinc-800 text-sm text-zinc-200 p-3 rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none"
                disabled={isGenerating}
            >
                <option value={ModelOption.FLASH}>Gemini 2.5 Flash (Fast)</option>
                <option value={ModelOption.PRO}>Gemini 3 Pro (High Quality)</option>
            </select>
        </div>

        {/* Dimension & Light Group */}
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <BoxSelect className="w-4 h-4 text-orange-400" />
                    Ratio
                </div>
                <select
                    value={params.aspectRatio}
                    onChange={(e) => setParams(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
                    className="w-full bg-zinc-800 text-sm text-zinc-200 p-3 rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none"
                    disabled={isGenerating}
                >
                    <option value={AspectRatio.SQUARE}>1:1 Square</option>
                    <option value={AspectRatio.LANDSCAPE}>16:9 Landscape</option>
                    <option value={AspectRatio.PORTRAIT}>9:16 Portrait</option>
                    <option value={AspectRatio.CLASSIC}>4:3 Classic</option>
                    <option value={AspectRatio.WIDE}>3:4 Tall</option>
                </select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Palette className="w-4 h-4 text-pink-400" />
                    Palette
                </div>
                <select
                    value={params.colorPalette}
                    onChange={(e) => setParams(prev => ({ ...prev, colorPalette: e.target.value as ColorPalette }))}
                    className="w-full bg-zinc-800 text-sm text-zinc-200 p-3 rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none"
                    disabled={isGenerating}
                >
                    <option value={ColorPalette.NONE}>Default</option>
                    {Object.values(ColorPalette).filter(v => v !== ColorPalette.NONE).map(palette => (
                        <option key={palette} value={palette}>{palette}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Lighting & Depth */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
             <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                Lighting & Atmosphere
            </div>
            <select
                value={params.lighting}
                onChange={(e) => setParams(prev => ({ ...prev, lighting: e.target.value as Lighting }))}
                className="w-full bg-zinc-800 text-sm text-zinc-200 p-3 rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none mb-3"
                disabled={isGenerating}
            >
                <option value={Lighting.NONE}>Default Lighting</option>
                {Object.values(Lighting).filter(v => v !== Lighting.NONE).map(l => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>

            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Aperture className="w-4 h-4 text-emerald-400" />
                Depth of Field
            </div>
            <select
                value={params.depthOfField}
                onChange={(e) => setParams(prev => ({ ...prev, depthOfField: e.target.value as DepthOfField }))}
                className="w-full bg-zinc-800 text-sm text-zinc-200 p-3 rounded-lg border border-zinc-700 focus:border-indigo-500 outline-none"
                disabled={isGenerating}
            >
                <option value={DepthOfField.NONE}>Default Focus</option>
                <option value={DepthOfField.SHALLOW}>{DepthOfField.SHALLOW}</option>
                <option value={DepthOfField.DEEP}>{DepthOfField.DEEP}</option>
            </select>
        </div>
        
        {/* Count Slider */}
        <div className={`space-y-2 pt-2 border-t border-zinc-800 transition-opacity ${isMultiPoint ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Image Count</span>
            <span className="text-indigo-400 font-mono">
                {isMultiPoint ? `${params.matrixPoints.length} (Matrix)` : params.imageCount}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={params.imageCount}
            onChange={(e) => setParams(prev => ({ ...prev, imageCount: parseInt(e.target.value) }))}
            className="w-full h-8 bg-transparent rounded-lg cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            disabled={isGenerating}
          />
        </div>

        {/* Chaos Dial (Seed) */}
        <div className="space-y-3 bg-zinc-800/30 p-3 rounded-xl border border-zinc-800 mt-2">
             <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-zinc-300 flex items-center gap-3 cursor-pointer select-none py-2">
                    <input 
                        type="checkbox"
                        checked={params.useChaosDial}
                        onChange={(e) => setParams(prev => ({...prev, useChaosDial: e.target.checked}))}
                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900 accent-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${params.useChaosDial ? 'text-amber-400' : 'text-zinc-500'}`} />
                        Entropy Dial
                    </div>
                </label>
                 {params.useChaosDial && (
                    <div className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                        S: {params.seed}
                    </div>
                 )}
            </div>
            
            {params.useChaosDial ? (
                 <SeedDial 
                    angle={params.seedAngle}
                    seed={params.seed}
                    onChange={(angle, seed) => setParams(prev => ({ ...prev, seedAngle: angle, seed: seed }))}
                />
            ) : (
                <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Manual Seed</label>
                        <input 
                            type="number" 
                            value={params.seed}
                            onChange={(e) => setParams(prev => ({...prev, seed: parseInt(e.target.value) || 0}))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                    </div>
                     <button 
                        onClick={() => setParams(prev => ({...prev, seed: Math.floor(Math.random() * 999999)}))}
                        className="mt-4 p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white transition-colors border border-zinc-600"
                        title="Generate Random Seed"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>

        {/* Style Matrix */}
        <div className="space-y-4 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-zinc-200">Style Matrix</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Axis X (Style A)</label>
                    <select 
                        value={params.styleA}
                        onChange={(e) => handleStyleChange('styleA', e.target.value)}
                        className="w-full bg-zinc-800 text-xs text-zinc-200 p-2.5 rounded border border-zinc-700 focus:border-indigo-500 outline-none"
                    >
                        {Object.values(StyleOption).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Axis Y (Style B)</label>
                    <select 
                        value={params.styleB}
                        onChange={(e) => handleStyleChange('styleB', e.target.value)}
                        className="w-full bg-zinc-800 text-xs text-zinc-200 p-2.5 rounded border border-zinc-700 focus:border-indigo-500 outline-none"
                    >
                        {Object.values(StyleOption).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <MatrixPlotter 
                points={params.matrixPoints}
                onChange={(points) => setParams(prev => ({ ...prev, matrixPoints: points }))}
                labelX={params.styleA}
                labelY={params.styleB}
            />

            {/* Shape Presets */}
            <div className="grid grid-cols-5 gap-2">
                <button onClick={() => setMatrixPattern('single')} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white flex items-center justify-center transition-colors" title="Single Point">
                    <MousePointer2 className="w-4 h-4" />
                </button>
                <button onClick={() => setMatrixPattern('corners')} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white flex items-center justify-center transition-colors" title="Corners">
                    <Square className="w-4 h-4" />
                </button>
                <button onClick={() => setMatrixPattern('diamond')} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white flex items-center justify-center transition-colors" title="Diamond">
                    <Diamond className="w-4 h-4" />
                </button>
                <button onClick={() => setMatrixPattern('grid')} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white flex items-center justify-center transition-colors" title="Grid / Cross">
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setMatrixPattern('free4')} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white flex items-center justify-center transition-colors" title="Free 4 Points">
                    <Move className="w-4 h-4" />
                </button>
            </div>
            {isMultiPoint && (
                <div className="text-[10px] text-zinc-500 text-center">
                    Generating {params.matrixPoints.length} images based on matrix points. <br/>
                    Drag points to customize style influence.
                </div>
            )}
        </div>

        {/* Negative Prompts */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
                <MinusCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-zinc-200">Negative Filter</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {NEGATIVE_PROMPTS_OPTIONS.map(opt => (
                    <button
                        key={opt}
                        onClick={() => toggleNegativePrompt(opt)}
                        className={`text-xs px-3 py-2 rounded-full border transition-all ${
                            params.negativePrompts.includes(opt)
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};