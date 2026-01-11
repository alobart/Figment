import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface SeedDialProps {
    angle: number;
    seed: number;
    onChange: (angle: number, seed: number) => void;
}

const MAX_SEED_VALUE = 2147483647; // Max 32-bit signed integer

const getSeedFromAngle = (angle: number): number => {
    const chaos = Math.sin(angle * 12.9898) * 43758.5453;
    const largeInt = Math.floor(Math.abs(chaos) * 1000000);
    // Modulo by max int32 to keep API happy
    return largeInt % MAX_SEED_VALUE;
};

export const SeedDial: React.FC<SeedDialProps> = ({ angle, seed, onChange }) => {
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleRandomize = () => {
        const randomAngle = Math.floor(Math.random() * 360);
        const newSeed = getSeedFromAngle(randomAngle);
        onChange(randomAngle, newSeed);
    };

    const calculateAngle = useCallback((clientX: number, clientY: number) => {
        if (!dialRef.current) return;
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const radians = Math.atan2(clientY - centerY, clientX - centerX);
        let degrees = radians * (180 / Math.PI);
        degrees = (degrees + 90 + 360) % 360;
        
        return Math.floor(degrees);
    }, []);

    // Unified Input Handler for Mouse and Touch
    const handleMove = useCallback((clientX: number, clientY: number) => {
        const newAngle = calculateAngle(clientX, clientY);
        if (newAngle !== undefined) {
            const newSeed = getSeedFromAngle(newAngle);
            onChange(newAngle, newSeed);
        }
    }, [calculateAngle, onChange]);

    // Mouse Events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            handleMove(e.clientX, e.clientY);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = 'default';
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMove]);

    // Touch Events (Passive listener issue on some browsers handled by React usually, but manual binding safer for move)
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling while rotating
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };
        const handleTouchEnd = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMove]);

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        // Stop propagation to prevent Sidebar from grabbing scroll
        e.stopPropagation(); 
        setIsDragging(true);
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            e.preventDefault();
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        
        handleMove(clientX, clientY);
    };

    const glowColor = `hsl(${angle}, 70%, 50%)`;

    return (
        <div className="flex items-center gap-4">
            <div 
                className="relative w-20 h-20 shrink-0 touch-none"
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                ref={dialRef}
            >
                {/* Tick Marks */}
                <div className="absolute inset-0 rounded-full border border-zinc-700 bg-zinc-800/50" />
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-0.5 h-1.5 bg-zinc-600 origin-bottom"
                        style={{
                            top: '4px',
                            left: '50%',
                            transform: `translateX(-50%) rotate(${i * 30}deg)`,
                            transformOrigin: '50% 36px'
                        }}
                    />
                ))}

                {/* Rotatable Body */}
                <div 
                    className="absolute inset-2 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full shadow-xl border border-zinc-600 flex items-center justify-center transition-shadow duration-75"
                    style={{ 
                        transform: `rotate(${angle}deg)`,
                        boxShadow: isDragging ? `0 0 15px ${glowColor}40` : ''
                    }}
                >
                        <div className="absolute top-1.5 w-1.5 h-1.5 rounded-full" 
                            style={{ 
                                backgroundColor: glowColor,
                                boxShadow: `0 0 8px ${glowColor}`
                            }} 
                    />
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-inner" />
                </div>
            </div>

            <div className="flex flex-col justify-center gap-2 flex-1">
                <p className="text-[10px] text-zinc-500 leading-tight">
                    Rotate to explore the randomness spectrum.
                </p>
                <button 
                    onClick={handleRandomize}
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg transition-colors border border-zinc-700 min-h-[44px]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Spin Dial
                </button>
            </div>
        </div>
    );
};