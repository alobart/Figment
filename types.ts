export interface Point {
  x: number;
  y: number;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
  params: GenerationParams;
  usedPoint: Point; // The specific point used for this image
}

export enum ModelOption {
  FLASH = "gemini-2.5-flash-image",
  PRO = "gemini-3-pro-image-preview"
}

export enum ColorPalette {
  NONE = "Default",
  VIBRANT = "Vibrant",
  PASTEL = "Pastel",
  MONOCHROME = "Monochrome",
  SEPIA = "Sepia",
  CYBER_NEON = "Cyber Neon",
  EARTH_TONES = "Earth Tones",
  COOL_BLUES = "Cool Blues",
  WARM_SUNSET = "Warm Sunset"
}

export enum AspectRatio {
  SQUARE = "1:1",
  LANDSCAPE = "16:9",
  PORTRAIT = "9:16",
  WIDE = "3:4", // Technically tall, but 3:4 / 4:3 are standard
  CLASSIC = "4:3"
}

export enum Lighting {
  NONE = "Default",
  GOLDEN_HOUR = "Golden Hour",
  CINEMATIC = "Cinematic Studio",
  DRAMATIC = "Dramatic/High Contrast",
  NATURAL = "Soft Natural Light",
  NEON = "Neon Rim Lights",
  BIOLUMINESCENT = "Bioluminescent Glow",
  FOGGY = "Moody Foggy",
  STUDIO = "Professional Studio"
}

export enum DepthOfField {
  NONE = "Default",
  SHALLOW = "Shallow (Bokeh/Blurry BG)",
  DEEP = "Deep (Everything in Focus)"
}

export interface GenerationParams {
  prompt: string;
  imageCount: number;
  seed: number;
  seedAngle: number; // Tracks the visual position of the dial (0-360)
  useChaosDial: boolean; // Toggles between Dial and Manual input
  styleA: string;
  styleB: string;
  matrixPoints: Point[]; 
  negativePrompts: string[];
  uploadedImage?: string; 
  model: ModelOption; 
  colorPalette: ColorPalette;
  aspectRatio: AspectRatio;
  lighting: Lighting;
  depthOfField: DepthOfField;
}

export enum StyleOption {
  NONE = "None",
  CYBERPUNK = "Cyberpunk",
  WATERCOLOR = "Watercolor",
  REALISTIC = "Photorealistic",
  SKETCH = "Pencil Sketch",
  RETRO = "Retro 80s",
  SURREAL = "Surrealism",
  PIXEL = "Pixel Art",
  PIXEL_GAME_ASSET = "2D Pixel Game Asset",
  VECTOR_ART = "Vector Art (Solid BG)",
  VECTOR_LAYERS = "Vector Layers (for Editing)",
  IMPRESSIONIST = "Impressionist",
  NOIR = "Film Noir",
  ANIME = "Anime",
  OIL_PAINTING = "Oil Painting",
  CLAY = "Claymation",
  HOLOGRAPHIC = "Holographic",
  RUBBER_HOSE = "Rubber Hose Cartoon",
  STEAMPUNK = "Steampunk",
  VAPORWAVE = "Vaporwave",
  UKIYOE = "Ukiyo-e Woodblock",
  LOW_POLY = "Low Poly 3D",
  GOTHIC = "Gothic Fantasy",
  POP_ART = "Pop Art",
  BAUHAUS = "Bauhaus Design",
  ART_NOUVEAU = "Art Nouveau",
  ISOMETRIC = "Isometric 3D",
  RENAISSANCE = "Renaissance Painting",
  GLITCH = "Glitch Art",
  PAPERCRAFT = "Papercraft Layered",
  GRAFFITI = "Street Art Graffiti",
  STAINED_GLASS = "Stained Glass"
}

export const NEGATIVE_PROMPTS_OPTIONS = [
  "Blurry",
  "Low Quality",
  "Distorted",
  "Bad Anatomy",
  "Text/Watermark",
  "Oversaturated",
  "Visual Noise/Clutter"
];