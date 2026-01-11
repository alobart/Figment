import React from 'react';
import { GeneratedImage } from '../types';
import { Trash2, Layers, Sparkles } from 'lucide-react';

interface HistoryStripProps {
    images: GeneratedImage[];
    onSelect: (image: GeneratedImage) => void;
    onDelete: (id: string) => void;
    onUseAsReference: (image: GeneratedImage) => void;
    onIterate: (image: GeneratedImage) => void;
}

export const HistoryStrip: React.FC<HistoryStripProps> = ({ images, onSelect, onDelete, onUseAsReference, onIterate }) => {
    if (images.length === 0) return null;

    const handleReferenceClick = (e: React.MouseEvent, img: GeneratedImage) => {
        e.stopPropagation();
        onUseAsReference(img);
    };

    const handleIterateClick = (e: React.MouseEvent, img: GeneratedImage) => {
        e.stopPropagation();
        onIterate(img);
    };

    return (
        <div className="h-32 md:h-40 w-full bg-zinc-900 border-t border-zinc-800 shrink-0 flex flex-col">
            <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                <span>History ({images.length})</span>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 pb-4">
                {images.slice().reverse().map((img) => (
                    <div 
                        key={img.id} 
                        className="group relative h-24 md:h-28 aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-indigo-500 transition-colors shrink-0 cursor-pointer"
                        onClick={() => onSelect(img)}
                    >
                        <img 
                            src={img.url} 
                            alt={img.prompt} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button 
                                onClick={(e) => handleReferenceClick(e, img)}
                                className="p-1.5 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition"
                                title="Use as Reference"
                            >
                                <Layers className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={(e) => handleIterateClick(e, img)}
                                className="p-1.5 bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500 hover:text-white transition"
                                title="Iterate Variations"
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                                className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};