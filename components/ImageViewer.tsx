import React, { useState, useEffect, useCallback } from 'react';
import { GeneratedImage } from '../types';
import { Download, X, Maximize2, Grid2X2, Layers, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
    images: GeneratedImage[];
    onClose: () => void;
    onUseAsReference: (image: GeneratedImage) => void;
    onIterate: (image: GeneratedImage) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, onClose, onUseAsReference, onIterate }) => {
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Reset focus when the image set changes completely
    useEffect(() => {
        setFocusedIndex(null);
    }, [images]);

    const handleNext = useCallback(() => {
        setFocusedIndex(prev => {
            if (prev === null) return null;
            return prev < images.length - 1 ? prev + 1 : 0; // Wrap around
        });
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setFocusedIndex(prev => {
            if (prev === null) return null;
            return prev > 0 ? prev - 1 : images.length - 1; // Wrap around
        });
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (focusedIndex === null) return;
            
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                // If in single view and there are multiple images, go back to grid
                if (images.length > 1) {
                    setFocusedIndex(null);
                } else {
                    // Otherwise close viewer
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, handleNext, handlePrev, images.length, onClose]);


    if (!images || images.length === 0) return null;

    const handleDownload = (img: GeneratedImage) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `nano-studio-${img.timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReferenceClick = (img: GeneratedImage) => {
        onUseAsReference(img);
        onClose(); // Close the viewer to go back to the prompt screen
    };

    // Determine viewing mode
    // If only 1 image exists, forces single view.
    // If multiple images exist, defaults to grid, unless focusedIndex is set.
    const isSingleView = images.length === 1 || focusedIndex !== null;
    const activeIndex = images.length === 1 ? 0 : (focusedIndex !== null ? focusedIndex : 0);
    const activeImage = images[activeIndex];

    // --- Single Image View ---
    if (isSingleView && activeImage) {
        return (
            <div className="flex-1 flex items-center justify-center bg-zinc-950/50 p-2 sm:p-4 md:p-6 overflow-hidden relative animate-in fade-in duration-200">
                <div className="relative w-full max-w-5xl max-h-full flex flex-col shadow-2xl shadow-black/50 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group/container">
                    
                    {/* Navigation Buttons (Only if multiple images) */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all border border-white/10 opacity-0 group-hover/container:opacity-100 hover:scale-110"
                                title="Previous Image (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all border border-white/10 opacity-0 group-hover/container:opacity-100 hover:scale-110"
                                title="Next Image (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Toolbar */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        {images.length > 1 && (
                            <button 
                                onClick={() => setFocusedIndex(null)}
                                className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10"
                                title="Back to Grid (Esc)"
                            >
                                <Grid2X2 className="w-5 h-5" />
                            </button>
                        )}
                         <button 
                            onClick={() => handleReferenceClick(activeImage)}
                            className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10"
                            title="Use as Reference"
                        >
                            <Layers className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={() => onIterate(activeImage)}
                            className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10"
                            title="Iterate Variations"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleDownload(activeImage)}
                            className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-sm transition-all border border-white/10"
                            title="Close View"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Image Container */}
                    <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-950/50 p-1 select-none">
                        <img 
                            key={activeImage.id} // Key change triggers animation if we want, but usually standard replacement is smoother
                            src={activeImage.url} 
                            alt={activeImage.prompt} 
                            className="max-w-full max-h-full object-contain shadow-lg animate-in fade-in duration-300"
                        />
                    </div>
                    
                    {/* Info Footer */}
                    <div className="bg-zinc-900 p-4 border-t border-zinc-800 shrink-0">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-zinc-100 font-medium truncate">{activeImage.prompt}</p>
                            {images.length > 1 && (
                                <span className="text-xs text-zinc-500 font-mono ml-4 shrink-0">
                                    {activeIndex + 1} / {images.length}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-mono">
                             <div className="flex items-center gap-1">
                                <span className="text-zinc-600">Seed:</span> 
                                <span className="text-zinc-300">{activeImage.params.seed}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <span className="text-zinc-600">Styles:</span>
                                <span className="text-zinc-300">{activeImage.params.styleA} + {activeImage.params.styleB}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <span className="text-zinc-600">Point:</span>
                                <span className="text-indigo-400">[{activeImage.usedPoint.x}, {activeImage.usedPoint.y}]</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Grid View ---
    return (
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden relative animate-in fade-in duration-300">
             <div className="absolute top-4 right-4 md:right-6 z-10">
                <button 
                    onClick={onClose}
                    className="p-2 bg-zinc-900/80 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-sm transition-all border border-zinc-700 hover:border-red-500 shadow-lg"
                    title="Close Gallery"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto h-full content-start py-8">
                    {images.map((img, idx) => (
                        <div 
                            key={img.id} 
                            className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10"
                        >
                            <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                <div className="flex justify-end gap-2 mb-auto pt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                     <button 
                                        onClick={() => setFocusedIndex(idx)}
                                        className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
                                        title="Maximize"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={() => handleReferenceClick(img)}
                                        className="p-2.5 bg-black/60 hover:bg-blue-600 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
                                        title="Use as Reference"
                                    >
                                        <Layers className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={() => onIterate(img)}
                                        className="p-2.5 bg-black/60 hover:bg-amber-500 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
                                        title="Iterate Variations"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={() => handleDownload(img)}
                                        className="p-2.5 bg-black/60 hover:bg-emerald-600 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-zinc-300 font-mono border border-white/5">
                                            {img.params.styleA}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-zinc-300 font-mono border border-white/5">
                                            {img.params.styleB}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-white line-clamp-1 opacity-90">{img.prompt}</div>
                                </div>
                            </div>
                            
                            {/* Always visible coordinate badge */}
                            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] text-zinc-400 font-mono opacity-60 group-hover:opacity-0 transition-opacity">
                                [{img.usedPoint.x}, {img.usedPoint.y}]
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};