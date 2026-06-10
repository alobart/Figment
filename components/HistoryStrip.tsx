import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { Trash2, Layers, Sparkles, Search, Loader2 } from 'lucide-react';
import { embedPrompt } from '../services/geminiService';

interface HistoryStripProps {
    images: GeneratedImage[];
    onSelect: (image: GeneratedImage) => void;
    onDelete: (id: string) => void;
    onUseAsReference: (image: GeneratedImage) => void;
    onIterate: (image: GeneratedImage) => void;
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

export const HistoryStrip: React.FC<HistoryStripProps> = ({ images, onSelect, onDelete, onUseAsReference, onIterate }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredImages(images.slice().reverse());
            return;
        }

        const performSearch = async () => {
            setIsSearching(true);
            try {
                const queryEmbedding = await embedPrompt(searchQuery);
                if (queryEmbedding.length === 0) {
                    // Fallback to text search if embedding fails
                    setFilteredImages(images.filter(img => img.prompt.toLowerCase().includes(searchQuery.toLowerCase())).reverse());
                    return;
                }

                const scoredImages = images.map(img => {
                    let score = 0;
                    if (img.embedding && img.embedding.length > 0) {
                        score = cosineSimilarity(queryEmbedding, img.embedding);
                    } else {
                        // Fallback score if no embedding
                        score = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.5 : 0;
                    }
                    return { img, score };
                });

                // Sort by score descending and filter out very low scores
                const sorted = scoredImages
                    .filter(item => item.score > 0.4) // Similarity threshold
                    .sort((a, b) => b.score - a.score)
                    .map(item => item.img);
                
                setFilteredImages(sorted);
            } catch (e) {
                console.error(e);
                setFilteredImages(images.filter(img => img.prompt.toLowerCase().includes(searchQuery.toLowerCase())).reverse());
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 600); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery, images]);

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
        <div className="h-40 md:h-48 w-full bg-zinc-900 border-t border-zinc-800 shrink-0 flex flex-col">
            <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                <span>History ({images.length})</span>
                <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-2 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Semantic Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-md pl-7 pr-8 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 w-48 transition-all"
                    />
                    {isSearching && <Loader2 className="w-3 h-3 absolute right-2 text-indigo-400 animate-spin" />}
                </div>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 pb-4">
                {filteredImages.length === 0 && searchQuery ? (
                    <div className="text-sm text-zinc-500 italic flex items-center justify-center w-full">No similar images found.</div>
                ) : (
                    filteredImages.map((img) => (
                        <div 
                            key={img.id} 
                            className="group relative h-24 md:h-32 aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-indigo-500 transition-colors shrink-0 cursor-pointer"
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
                    ))
                )}
            </div>
        </div>
    );
};