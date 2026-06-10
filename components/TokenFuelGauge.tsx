import React from 'react';
import { Fuel, Type } from 'lucide-react';
import { GenerationParams } from '../types';
import { constructEnrichedPrompt } from '../services/geminiService';

interface TokenFuelGaugeProps {
  params: GenerationParams;
}

export const TokenFuelGauge: React.FC<TokenFuelGaugeProps> = ({ params }) => {
  // We use the first matrix point to estimate the prompt size for the batch
  const samplePoint = params.matrixPoints[0] || { x: 0, y: 0 };
  
  // Get the EXACT prompt string that will be sent to the API
  let exactPrompt = constructEnrichedPrompt(params, samplePoint);
  
  // Add the Latent Variation Seed string length that gets appended in the service
  const seedOffset = params.useCustomSeed ? params.seed : 12345678; // Dummy seed for estimation
  exactPrompt += `\n\n[Latent Variation Seed: ${seedOffset}]`;

  const charCount = exactPrompt.length;
  
  // Gemini approx: 1 token ~= 4 chars
  const textTokens = Math.ceil(charCount / 4);
  
  // Image (Fixed cost for Flash/Pro image inputs)
  const imageTokens = params.uploadedImage ? 258 : 0; 
  
  const totalTokens = textTokens + imageTokens;

  // Visual scale: Arbitrary "standard prompt" size for visualization
  // 3000 is a safe buffer for Gemini 2.5 Flash Image which has large context, but we want the bar to move visibly.
  const MAX_DISPLAY = 3000;
  const percentage = Math.min((totalTokens / MAX_DISPLAY) * 100, 100);
  
  // Color logic
  let colorClass = "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]";
  if (totalTokens > 1500) colorClass = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
  if (totalTokens > 2500) colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800/50 backdrop-blur-sm select-none" title={`Exact Prompt Size: ${charCount} chars | Approx Tokens: ${totalTokens} (Text: ${textTokens}, Image: ${imageTokens})`}>
      <div className="flex items-center gap-1.5">
        <Type className={`w-3.5 h-3.5 ${charCount > 0 ? 'text-zinc-300' : 'text-zinc-600'}`} />
        <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">{charCount}c</span>
      </div>
      <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-2">
        <Fuel className={`w-3.5 h-3.5 ${totalTokens > 0 ? 'text-zinc-300' : 'text-zinc-600'}`} />
        <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">{totalTokens}t</span>
      </div>
      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative ml-1">
        <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${colorClass}`} 
            style={{ width: `${Math.max(2, percentage)}%` }}
        />
      </div>
    </div>
  );
};