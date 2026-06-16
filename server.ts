import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/generate-images", async (req, res) => {
    try {
      const { params, finalPrompt, config } = req.body;
      let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      apiKey = apiKey?.trim();

      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "your_api_key_here") {
        return res.status(401).json({ error: "API Key not found or invalid on server. Please ensure GEMINI_API_KEY is correctly set in your environment variables." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [{ text: finalPrompt }];

      if (params.uploadedImage) {
        const dataUrl = params.uploadedImage;
        const base64Data = dataUrl.split(',')[1] || "";
        const match = dataUrl.match(/^data:(.*);base64,/);
        const mimeType = match ? match[1] : 'image/png';

        parts.unshift({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          }
        });
      }

      const response = await ai.models.generateContent({
        model: params.model,
        contents: { parts },
        config
      });

      res.json(response);
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image." });
    }
  });

  app.post("/api/embed-prompt", async (req, res) => {
    try {
      const { text } = req.body;
      let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      apiKey = apiKey?.trim();

      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "your_api_key_here") {
        return res.status(401).json({ error: "API Key not found or invalid on server. Please ensure GEMINI_API_KEY is correctly set in your environment variables." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [text],
      });

      res.json(result);
    } catch (error: any) {
      console.error("Embedding error:", error);
      res.status(500).json({ error: error.message || "Failed to embed prompt." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
