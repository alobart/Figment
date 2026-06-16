import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: '50mb' }));

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
    let errorMsg = error.message || "Failed to generate image.";
    try {
      // If the error message is a stringified JSON (from the google api), extract the message
      const parsed = JSON.parse(errorMsg);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      } else if (parsed[0] && parsed[0].message) {
        errorMsg = parsed[0].message;
      }
    } catch(e) {}
    if (errorMsg.includes("API key not valid")) {
      errorMsg = "API key not valid. Please check your GEMINI_API_KEY environment variable.";
    }
    res.status(500).json({ error: errorMsg });
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
    let errorMsg = error.message || "Failed to embed prompt.";
    try {
      const parsed = JSON.parse(errorMsg);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      } else if (parsed[0] && parsed[0].message) {
        errorMsg = parsed[0].message;
      }
    } catch(e) {}
    if (errorMsg.includes("API key not valid")) {
      errorMsg = "API key not valid. Please check your GEMINI_API_KEY environment variable.";
    }
    res.status(500).json({ error: errorMsg });
  }
});

export default app;
