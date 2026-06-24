import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large request body for base64 audio payloads
app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes FIRST
app.post("/api/chat", async (req, res) => {
  try {
    const { contents } = req.body;
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: "Invalid contents parameter." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "សូមកំណត់ GEMINI_API_KEY នៅក្នុង Settings > Secrets!" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are 'គ្រូបង្វឹកដឹកនាំ' (AI Leadership Coach), an expert virtual study assistant and leadership coach specialized in the Cambodian book 'យុទ្ធសាស្ត្រដឹកនាំបុគ្គលិក' (Employee Leadership Strategies).
Your goal is to help Cambodian readers understand, reflect upon, and apply leadership principles.
Your tone must be warm, exceptionally polite, professional, and encouraging. Use beautiful, standard Khmer language.
You should:
1. Provide practical, modern management advice adapted to the Cambodian business environment, labor laws, cultural values (e.g., respect, team harmony, communication), and realities.
2. Be capable of explaining concepts from the book, summarizing chapters, discussing case studies, or giving constructive feedback on the user's leadership ideas.
3. Keep answers well-structured, clear, and action-oriented. Format responses with neat bullet points or numbers when appropriate.
4. When talking about the book chapters, refer to the book content appropriately.`,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini API." });
  }
});

app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Missing audioData." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "សូមកំណត់ GEMINI_API_KEY នៅក្នុង Settings > Secrets!" });
    }

    const cleanMimeType = mimeType || "audio/wav";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: audioData,
            mimeType: cleanMimeType,
          },
        },
        {
          text: "សូមបម្លែងសំឡេងនិយាយភាសាខ្មែរ ឬអង់គ្លេសនេះទៅជាអត្ថបទអក្សរ (Transcribe) ឲ្យបានត្រឹមត្រូវបំផុតតាមសំឡេងដែលបានឮ។ សរសេរតែអត្ថបទដែលឮប៉ុណ្ណោះ មិនបាច់សរសេរការពន្យល់បន្ថែមឡើយ។",
        },
      ],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Transcription Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during audio transcription." });
  }
});

async function startServer() {
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
