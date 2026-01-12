import React, { useRef, useEffect, useState } from 'react';
import { Point } from '../types';

interface MatrixPlotterProps {
    points: Point[];
    onChange: (points: Point[]) => void;
    labelX: string;
    labelY: string;
    mode?: 'free' | 'vertical' | 'horizontal';
}

export const MatrixPlotter: React.FC<MatrixPlotterProps> = ({ points, onChange, labelX, labelY, mode = 'free' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const getCoordsFromEvent = (clientX: number, clientY: number): Point | null => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.getBoundingClientRect();
        
        let newX = (clientX - rect.left) / rect.width;
        let newY = (clientY - rect.top) / rect.height;

        // Note: We don't clamp here immediately if we are in group mode, 
        // because we need the raw delta. But existing logic clamps 0-1.
        // Let's stick to clamping 0-1 for the cursor relative to box, 
        // then calculate world coordinates.
        newX = Math.max(0, Math.min(1, newX));
        newY = Math.max(0, Math.min(1, newY));

        const coordX = parseFloat(((newX * 2) - 1).toFixed(2));
        const coordY = parseFloat((-((newY * 2) - 1)).toFixed(2));
        return { x: coordX, y: coordY };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingIndex(index);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (draggingIndex === null) return;
        
        const coords = getCoordsFromEvent(clientX, clientY);
        if (!coords) return;

        if (mode === 'vertical' || mode === 'horizontal') {
            // Group Move Logic
            const currentPoint = points[draggingIndex];
            const dx = coords.x - currentPoint.x;
            const dy = coords.y - currentPoint.y;
            
            // Calculate potential new positions
            const potentialPoints = points.map(p => ({
                x: p.x + dx,
                y: p.y + dy
            }));

            // Calculate Bounds of the group
            let minX = 2, maxX = -2, minY = 2, maxY = -2;
            potentialPoints.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });

            // Calculate shift required to keep inside [-1, 1]
            let shiftX = 0;
            let shiftY = 0;

            if (minX < -1) shiftX = -1 - minX;
            else if (maxX > 1) shiftX = 1 - maxX;

            if (minY < -1) shiftY = -1 - minY;
            else if (maxY > 1) shiftY = 1 - maxY;

            // Apply safe coordinates
            const finalPoints = potentialPoints.map(p => ({
                x: parseFloat((p.x + shiftX).toFixed(2)),
                y: parseFloat((p.y + shiftY).toFixed(2))
            }));
            
            onChange(finalPoints);

        } else {
            // Free Move Logic
            const newPoints = [...points];
            newPoints[draggingIndex] = coords;
            onChange(newPoints);
        }
    };

    // Mouse Events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingIndex !== null) handleMove(e.clientX, e.clientY);
        };
        const handleMouseUp = () => setDraggingIndex(null);

        if (draggingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingIndex, points, mode]);

    // Touch Events
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (draggingIndex !== null) {
                e.preventDefault(); // Stop scrolling
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const handleTouchEnd = () => setDraggingIndex(null);

        if (draggingIndex !== null) {
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [draggingIndex, points, mode]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full aspect-square bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden select-none touch-none group ${
                draggingIndex !== null ? 'cursor-grabbing' : ''
            }`}
        >
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-700" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-700" />
            </div>

            {/* Labels */}
            <div className="absolute top-2 right-2 text-[10px] text-green-500 font-mono pointer-events-none opacity-50">
                (+, +)
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] text-red-500 font-mono pointer-events-none opacity-50">
                (-, -)
            </div>
            
            {/* Visual Guide for locked lines */}
            {(mode === 'vertical' || mode === 'horizontal') && points.length > 1 && (
                 <div className="absolute inset-0 pointer-events-none opacity-20">
                    {/* Draw a line connecting min/max points? */}
                    {/* Using a simple bounding box or SVG line could be nice but CSS lines are easier if we know orientation */}
                    {mode === 'vertical' && (
                        <div 
                            className="absolute bg-indigo-500/50 w-px"
                            style={{
                                left: `${((points[0].x + 1) / 2) * 100}%`,
                                top: `${((-Math.max(...points.map(p=>p.y)) + 1) / 2) * 100}%`,
                                bottom: `${100 - ((-Math.min(...points.map(p=>p.y)) + 1) / 2) * 100}%`,
                            }}
                        />
                    )}
                     {mode === 'horizontal' && (
                        <div 
                            className="absolute bg-indigo-500/50 h-px"
                            style={{
                                top: `${((-points[0].y + 1) / 2) * 100}%`,
                                left: `${((Math.min(...points.map(p=>p.x)) + 1) / 2) * 100}%`,
                                right: `${100 - ((Math.max(...points.map(p=>p.x)) + 1) / 2) * 100}%`,
                            }}
                        />
                    )}
                 </div>
            )}

            {/* Render All Points */}
            {points.map((p, idx) => {
                const percentX = ((p.x + 1) / 2) * 100;
                const percentY = ((-p.y + 1) / 2) * 100;
                const isMulti = points.length > 1;
                const isDraggingThis = idx === draggingIndex;
                const isGroupMove = (mode === 'vertical' || mode === 'horizontal') && draggingIndex !== null;

                return (
                    <div 
                        key={idx}
                        onMouseDown={(e) => handleStart(e, idx)}
                        onTouchStart={(e) => handleStart(e, idx)}
                        className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-grab active:cursor-grabbing
                            ${isDraggingThis ? 'w-5 h-5 z-20' : 'w-4 h-4 z-10'}
                            ${isMulti ? 'bg-indigo-400 border border-white/80' : 'bg-indigo-500 border-2 border-white'}
                            ${isDraggingThis || isGroupMove ? 'shadow-[0_0_15px_rgba(99,102,241,0.8)] scale-110' : 'shadow-lg shadow-indigo-500/30'}
                        `}
                        style={{ left: `${percentX}%`, top: `${percentY}%` }}
                    />
                );
            })}
            
            {/* Live readout */}
            <div className="absolute bottom-0 right-0 bg-zinc-900/90 px-2 py-1 text-[10px] text-zinc-400 font-mono border-tl rounded-tl backdrop-blur-sm pointer-events-none">
                {draggingIndex !== null 
                    ? `Active: X:${points[draggingIndex].x.toFixed(2)} Y:${points[draggingIndex].y.toFixed(2)}` 
                    : points.length > 1 ? `${points.length} Points` : `X:${points[0]?.x.toFixed(2)} Y:${points[0]?.y.toFixed(2)}`
                }
            </div>
        </div>
    );
};