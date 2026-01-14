import { GoogleGenAI } from "@google/genai";
import { GenerationParams, StyleOption, Point, ColorPalette, Lighting, DepthOfField, ModelOption } from "../types";

// Helper to clean base64 string for API usage
const extractBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || "";
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/png';
}

const COLOR_PALETTE_PROMPTS: Record<string, string> = {
  [ColorPalette.VIBRANT]: "vibrant colors, high saturation, intense vivid tones, colorful",
  [ColorPalette.PASTEL]: "pastel color palette, soft washed-out colors, desaturated, gentle tones, soothing",
  [ColorPalette.MONOCHROME]: "black and white, monochromatic, grayscale, high contrast, noir aesthetic",
  [ColorPalette.SEPIA]: "sepia tone, vintage photo effect, warm brown overlay, nostalgic, old paper texture",
  [ColorPalette.CYBER_NEON]: "neon color palette, cyan, magenta, electric purple, glowing lights, dark background",
  [ColorPalette.EARTH_TONES]: "earthy color palette, forest greens, browns, beige, natural organic tones, muted",
  [ColorPalette.COOL_BLUES]: "cool color palette, shades of blue, teal, icy tones, calm, winter atmosphere",
  [ColorPalette.WARM_SUNSET]: "warm color palette, golden hour colors, orange, red, yellow, inviting, sunset glow",
  [ColorPalette.NONE]: ""
};

const LIGHTING_PROMPTS: Record<string, string> = {
  [Lighting.GOLDEN_HOUR]: "golden hour lighting, warm sunlight, long shadows, soft sun flare, magical atmosphere",
  [Lighting.CINEMATIC]: "cinematic lighting, dramatic atmosphere, professional color grading, rim lights, volumetric lighting",
  [Lighting.DRAMATIC]: "high contrast lighting, chiaroscuro, deep shadows, intense highlights, dramatic mood",
  [Lighting.NATURAL]: "soft natural lighting, diffused daylight, even exposure, realistic environmental light",
  [Lighting.NEON]: "neon rim lighting, colored gel lights, cybernetic glow, dark background with bright accents",
  [Lighting.BIOLUMINESCENT]: "bioluminescent glow, ethereally lit, glowing organic elements, magical night scene",
  [Lighting.FOGGY]: "foggy atmosphere, diffused light, mist, depth haze, mysterious mood, soft scattering",
  [Lighting.STUDIO]: "professional studio lighting, 3-point lighting setup, softbox, perfect even illumination, neutral background influence",
  [Lighting.NONE]: ""
};

const DEPTH_PROMPTS: Record<string, string> = {
  [DepthOfField.SHALLOW]: "shallow depth of field, strong bokeh, blurred background, sharp focus on subject, macro photography feel, f/1.8 aperture",
  [DepthOfField.DEEP]: "deep depth of field, everything in focus, sharp background, f/16 aperture, hyper-clear landscape",
  [DepthOfField.NONE]: ""
};

const STYLE_PROMPTS: Record<string, string> = {
  [StyleOption.CYBERPUNK]: "cyberpunk aesthetic, neon-drenched night city, high-tech low-life, cybernetics, chromatic aberration, rain-slicked streets, futuristic dystopia, bioluminescent accents, synthwave palette",
  [StyleOption.WATERCOLOR]: "traditional watercolor painting, wet-on-wet technique, soft bleeding edges, translucent layers, textured paper grain, artistic splatters, dreamy pastel colors, fluid strokes",
  [StyleOption.REALISTIC]: "photorealistic 8k, unreal engine 5 render, cinematic lighting, ray tracing, incredibly detailed, sharp focus, macro photography texture, depth of field, raw photo realism",
  [StyleOption.SKETCH]: "rough charcoal sketch, graphite pencil lines, cross-hatching shading, monochromatic greyscale, hand-drawn on textured paper, artistic draftsmanship, expressive linework",
  [StyleOption.RETRO]: "80s retro synthwave, neon grid landscape, VHS tracking error, lo-fi aesthetic, chrome typography, vibrant magenta and cyan, CRT monitor scanlines, retro-futurism",
  [StyleOption.SURREAL]: "surrealist masterpiece, salvador dali style, melting clocks and objects, impossible geometry, dreamlike atmosphere, subconscious imagery, eerie fog, bizarre juxtapositions",
  [StyleOption.PIXEL]: "pixel art, 16-bit retro game sprite, limited color palette, dithering patterns, blocky aesthetic, sharp pixel edges, chiptune vibe, nostalgic arcade style",
  [StyleOption.PIXEL_GAME_ASSET]: "professional 2d game asset, pixel art sprite, transparent background friendly, clean outlines, flat perspective or side view, unified 32-bit color palette, crisp edges, suitable for unity/godot, no anti-aliasing blur",
  [StyleOption.VECTOR_ART]: "professional flat vector illustration, clean svg style, solid single-color background, minimalist design, sharp distinct lines, adobe illustrator aesthetic, geometric composition, no photorealism, vibrant solid colors, high quality icon style",
  [StyleOption.VECTOR_LAYERS]: "Professional vector illustration with distinct, easily separable layers. Each element is a whole shape with solid colors and bold, clean outlines. Flat design aesthetic, no gradients or complex textures. The style should be suitable for creating die-cut stickers or layered papercraft, where each color can be isolated easily. Minimalist, graphic design, crisp edges.",
  [StyleOption.IMPRESSIONIST]: "impressionist oil painting, claude monet style, visible dabbing brushstrokes, vibrant natural light, capturing fleeting moments, atmospheric perspective, rich texture",
  [StyleOption.NOIR]: "classic film noir, high contrast black and white, chiaroscuro lighting, dramatic shadows, silhouette, detective mystery atmosphere, cinematic film grain, moody rain",
  [StyleOption.ANIME]: "high-quality anime art, studio ghibli style, cel-shaded characters, vibrant detailed backgrounds, emotive expressions, dynamic camera angles, 2D animation aesthetic",
  [StyleOption.OIL_PAINTING]: "classical oil painting on canvas, thick impasto texture, rich pigments, traditional masterpiece techniques, dramatic lighting, visible brushwork, varnish finish",
  [StyleOption.CLAY]: "claymation stop-motion, plasticine texture, thumbprint details, aardman style, miniature set design, soft lighting, handcrafted diorama look, depth of field",
  [StyleOption.HOLOGRAPHIC]: "futuristic 3D hologram, translucent light projection, volumetric glow, cyan and magenta data streams, sci-fi interface, floating particles, cybernetic visualization",
  [StyleOption.RUBBER_HOSE]: "1930s rubber hose animation, vintage black and white cartoon, pie-cut eyes, rhythmic bounce, film grain and scratches, steamboat willie aesthetic, whimsical and surreal",
  [StyleOption.STEAMPUNK]: "steampunk aesthetic, brass gears and cogs, steam-powered machinery, victorian sci-fi, copper piping, leather straps, ornate clockwork, sepia atmosphere, industrial fantasy",
  [StyleOption.VAPORWAVE]: "vaporwave aesthetic, 90s CGI surrealism, greek statues, glitch art, pastel pink and teal gradients, tropical ferns, checkerboard floors, nostalgic windows 95 vibe",
  [StyleOption.UKIYOE]: "ukiyo-e japanese woodblock print, hokusai style, flat perspective, bold outlines, textured washi paper, traditional mineral colors, wave patterns, eastern art aesthetic",
  [StyleOption.LOW_POLY]: "low poly 3d art, geometric facets, flat shading, minimal detail, sharp angles, vibrant pastel colors, isometric blender render, abstract shapes",
  [StyleOption.GOTHIC]: "dark gothic fantasy, ornate cathedral architecture, brooding atmosphere, stained glass, gargoyles, mist and shadows, dark color palette, mystical and ancient",
  [StyleOption.POP_ART]: "pop art style, roy lichtenstein dots, bold black outlines, vibrant primary colors, commercial comic strip aesthetic, high contrast, ironic mass media vibe, halftone patterns",
  [StyleOption.BAUHAUS]: "bauhaus modernist design, geometric abstraction, form follows function, clean lines, primary color palette (red yellow blue), minimalist composition, industrial graphic style",
  [StyleOption.ART_NOUVEAU]: "art nouveau style, alphonse mucha, organic flowing lines, intricate floral borders, muted gold and pastel tones, elegant and decorative, stained glass influence, romantic",
  [StyleOption.ISOMETRIC]: "isometric orthographic projection, 3d diorama, miniature world, clean lines, detailed environment, simcity aesthetic, tilt-shift effect, structural clarity",
  [StyleOption.RENAISSANCE]: "high renaissance painting, leonardo da vinci, sfumato technique, chiaroscuro lighting, anatomical realism, oil on wood texture, classical composition, dramatic drapery",
  [StyleOption.GLITCH]: "digital glitch art, datamoshing, pixel sorting, chromatic aberration, visual noise, signal corruption, distorted reality, cyberpunk error aesthetic, broken video file",
  [StyleOption.PAPERCRAFT]: "layered paper cutting art, depth and shadows, origami textures, handmade craft aesthetic, vibrant paper colors, tactile 3d effect, shadow box diorama",
  [StyleOption.GRAFFITI]: "urban street art, spray paint textures, vibrant graffiti mural, drip effects, bold tags, hip-hop culture, concrete wall background, wildstyle lettering",
  [StyleOption.STAINED_GLASS]: "stained glass window art, illuminated mosaic, vibrant translucent colors, heavy lead lines, religious or geometric patterns, light refraction, glowing glass",
  [StyleOption.SESAME]: "Sesame Street style, Jim Henson muppet aesthetic, fuzzy felt texture, foam puppets, colorful fur, googly eyes, playful television studio lighting, 1980s PBS aesthetic, fabric textures, soft focus background",
  [StyleOption.NONE]: "",
  
  // New Styles
  [StyleOption.DIORAMA]: "museum diorama, taxidermy display, natural history museum, glass case reflection, painted backdrop, realistic fur texture, still life, educational display, soft overhead spot lighting",
  [StyleOption.MINIATURE]: "hand-painted miniature wargaming figure, citadel paints style, edge highlighting, washes and shading, plastic model texture, tabletop terrain background, macro photography, depth of field, high contrast painting",
  [StyleOption.COLLAGE]: "photomontage, mixed media collage, overlapping photographs, ripped paper edges, chaotic composition, multiple perspectives, dadaist style, cut and paste aesthetic",
  [StyleOption.MOSAIC]: "organic mosaic art, arranged pebbles and tiles, natural stones, grout texture, ancient roman style, intricate geometric patterns, tactile surface, uneven handmade look",
  [StyleOption.TIE_DYE]: "tie-dye fabric pattern, psychedelic spiral, vibrant bleeding colors, hippie aesthetic, fabric texture, 60s counterculture, liquid organic shapes, saturation",
  [StyleOption.POINTILLISM]: "pointillism technique, georges seurat style, distinct small dots of color, optical blending, stippling, fine detail, vibrant luminosity, divisionism",
  [StyleOption.PS1]: "PS1 aesthetics, 32-bit graphics, affine texture mapping, jittery polygons, low resolution textures, jagged edges, dithering, 90s console gaming, CRT filter",
  [StyleOption.GUNPLA]: "gunpla plastic model kit, injection molding, panel lining, decals and stickers, articulated joints, sprue marks, scale model photography, satin finish, mecha hobby",
  [StyleOption.KAWAII]: "kawaii aesthetic, sanrio style, pastel colors, cute rounded shapes, blushing cheeks, sparkles and hearts, vector illustration, soft outlines, adorable character design",
  [StyleOption.TOULOUSE]: "henri de toulouse-lautrec style, moulin rouge poster, lithograph texture, bold silhouette, expressive outlines, flat colors, belle epoque atmosphere, cabaret art"
};

const constructEnrichedPrompt = (params: GenerationParams, point: Point): string => {
  const { prompt, styleA, styleB, negativePrompts, colorPalette, lighting, depthOfField } = params;
  const { x: matrixX, y: matrixY } = point;
  
  let enrichedPrompt = `Subject: ${prompt}.`;

  // Apply Modifiers
  if (lighting && LIGHTING_PROMPTS[lighting]) {
    enrichedPrompt += ` Lighting: ${LIGHTING_PROMPTS[lighting]}.`;
  }
  
  if (depthOfField && DEPTH_PROMPTS[depthOfField]) {
    enrichedPrompt += ` Focus: ${DEPTH_PROMPTS[depthOfField]}.`;
  }

  if (colorPalette && COLOR_PALETTE_PROMPTS[colorPalette]) {
    enrichedPrompt += ` Color Scheme: ${COLOR_PALETTE_PROMPTS[colorPalette]}.`;
  }

  const getStyleInstruction = (style: string, intensity: number): string => {
    if (style === StyleOption.NONE || !STYLE_PROMPTS[style]) return "";
    
    // Ignore small values close to center to prevent noise
    if (Math.abs(intensity) < 0.15) return "";

    const keywords = STYLE_PROMPTS[style];

    if (intensity > 0) {
        // Positive Influence
        if (intensity > 0.6) {
            return `Strongly apply style: ${style}. key visuals: ${keywords}. (Weight: High)`;
        } else {
             return `Blend with style: ${style}. key visuals: ${keywords}. (Weight: Medium)`;
        }
    } else {
        // Negative Influence (Avoidance)
        return `Strictly avoid ${style} style. Ensure image does NOT contain: ${keywords}.`;
    }
  };

  const instructionA = getStyleInstruction(styleA, matrixX);
  const instructionB = getStyleInstruction(styleB, matrixY);

  if (instructionA) enrichedPrompt += ` ${instructionA}`;
  if (instructionB) enrichedPrompt += ` ${instructionB}`;

  // Negative Prompts
  if (negativePrompts.length > 0) {
    enrichedPrompt += ` Negative constraints (avoid): ${negativePrompts.join(", ")}.`;
  }
  
  // Quality Boosters
  enrichedPrompt += " Image requirements: High fidelity, detailed texture, accurate lighting, aesthetically pleasing composition.";

  return enrichedPrompt;
};

interface GenerationResult {
    url: string;
    point: Point;
}

export const generateImages = async (params: GenerationParams): Promise<GenerationResult[]> => {
  // Use VITE_GEMINI_API_KEY from import.meta.env
  // Fallback to VITE_API_KEY if needed.
  // Cast import.meta to any to avoid TS errors if types are not configured for Vite
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_API_KEY;

  if (!apiKey) {
      throw new Error("API Key not found. Please set VITE_GEMINI_API_KEY in your Vercel Project Settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const tasks: { point: Point }[] = [];

  if (params.matrixPoints.length > 1) {
    params.matrixPoints.forEach((point) => {
        tasks.push({ point });
    });
  } else {
    const point = params.matrixPoints[0] || { x: 0, y: 0 };
    for (let i = 0; i < params.imageCount; i++) {
        tasks.push({ point });
    }
  }

  const promises = tasks.map(async (task) => {
    const finalPrompt = constructEnrichedPrompt(params, task.point);
    const config: any = { 
        imageConfig: {
            aspectRatio: params.aspectRatio
        }
    };
    
    // Pass seed if custom seed is enabled
    if (params.useCustomSeed) {
        config.seed = params.seed;
    }
    
    if (params.model === ModelOption.PRO) {
        config.imageConfig.imageSize = "1K";
    }

    try {
      const parts: any[] = [{ text: finalPrompt }];

      if (params.uploadedImage) {
        parts.unshift({
          inlineData: {
            data: extractBase64Data(params.uploadedImage),
            mimeType: getMimeType(params.uploadedImage),
          }
        });
      }

      const response = await ai.models.generateContent({
        model: params.model,
        contents: { parts },
        config
      });

      if (response?.candidates?.[0]?.content?.parts) {
         for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
               return {
                 url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                 point: task.point
               };
            }
         }
      }
      throw new Error("Model returned no image data.");
    } catch (error: any) {
      // Propagate error message to UI
      throw new Error(error.message || "Failed to generate image.");
    }
  });

  // Use allSettled to allow partial success in a batch
  const results = await Promise.allSettled(promises);
  
  const successfulImages: GenerationResult[] = [];
  let errorMsg = "";

  results.forEach(result => {
      if (result.status === 'fulfilled') {
          successfulImages.push(result.value);
      } else {
          errorMsg = result.reason.message;
      }
  });

  if (successfulImages.length === 0 && errorMsg) {
      throw new Error(errorMsg);
  }

  return successfulImages;
};