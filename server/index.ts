import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initDB } from "./db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is required");
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/data", taskRoutes);

  app.post("/api/diagnose", async (req, res) => {
    try {
      const { taskName, feelingId, feelingLabel, feelingDesc } = req.body;
      if (!taskName) return res.status(400).json({ error: "taskName is required" });

      if (!process.env.GEMINI_API_KEY) {
        return res.json(getDeterministicFallback(feelingId, taskName));
      }

      const ai = getGemini();
      const prompt = `Diagnose the cognitive block for this academic task:\nTask Name: "${taskName}"\nSelected Feeling: "${feelingLabel}" (${feelingDesc})\nFeeling Option Code: ${feelingId}\n\nReturn a structured JSON with a professional, mission-control output.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are SURGE (Lvl-4 Protocol), an advanced mission-control scheduling assistant. Analyze the user's cognitive obstacle. Generate: blockType (FOG/FEAR/FRICTION/FAKE), diagnosisTitle, diagnosisText, interventionLabel, interventionSteps (3-4 steps).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blockType: { type: Type.STRING },
              diagnosisTitle: { type: Type.STRING },
              diagnosisText: { type: Type.STRING },
              interventionLabel: { type: Type.STRING },
              interventionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["blockType", "diagnosisTitle", "diagnosisText", "interventionLabel", "interventionSteps"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini API");
      let parsed: any;
      try {
        parsed = JSON.parse(resultText);
      } catch {
        throw new Error("Invalid JSON from Gemini API");
      }
      res.json(parsed);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      res.json(getDeterministicFallback(req.body.feelingId || "1", req.body.taskName || "current task"));
    }
  });

  app.post("/api/optimize-week", async (req, res) => {
    try {
      const { tasks, subjects } = req.body;
      if (!process.env.GEMINI_API_KEY) return res.json(getFallbackOptimization(tasks));

      const ai = getGemini();
      const prompt = `Optimize this academic weekly schedule to prevent burnout:\nTasks: ${JSON.stringify(tasks)}\nSubjects: ${JSON.stringify(subjects)}\nReturn optimizedTasks with day/startHour/durationHours/reason and strategyText.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are SURGE schedule optimizer. Rebalance tasks to avoid burnout. Return JSON with optimizedTasks array and strategyText.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, day: { type: Type.INTEGER }, startHour: { type: Type.INTEGER }, durationHours: { type: Type.NUMBER }, reason: { type: Type.STRING } } } },
              strategyText: { type: Type.STRING }
            },
            required: ["optimizedTasks", "strategyText"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response");
      let parsed: any;
      try {
        parsed = JSON.parse(resultText);
      } catch {
        throw new Error("Invalid JSON from Gemini API");
      }
      res.json(parsed);
    } catch (err) {
      console.error("Optimization error:", err);
      res.json(getFallbackOptimization(req.body.tasks || []));
    }
  });

  app.post("/api/suggest-slots", async (req, res) => {
    try {
      const { tasks, subjects } = req.body;
      if (!process.env.GEMINI_API_KEY) return res.json(getFallbackSuggestions());

      const ai = getGemini();
      const prompt = `Suggest 2 optimal study/recovery windows for these tasks:\n${JSON.stringify(tasks)}\nSubjects: ${JSON.stringify(subjects)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: `Generate exactly 2 slots with title, type, confidence, day, startHour, durationHours, timeString.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, type: { type: Type.STRING }, confidence: { type: Type.INTEGER }, day: { type: Type.INTEGER }, startHour: { type: Type.INTEGER }, durationHours: { type: Type.NUMBER }, timeString: { type: Type.STRING } } } }
            },
            required: ["suggestions"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response");
      let parsed: any;
      try {
        parsed = JSON.parse(resultText);
      } catch {
        throw new Error("Invalid JSON from Gemini API");
      }
      res.json(parsed);
    } catch (err) {
      console.error("Suggest slots error:", err);
      res.json(getFallbackSuggestions());
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SURGE server active on http://0.0.0.0:${PORT}`);
  });
}

function getDeterministicFallback(feelingId: string | number, taskName: string) {
  const code = String(feelingId);
  const fallbacks: Record<string, any> = {
    "1": { blockType: "FOG", diagnosisTitle: "SYSTEM DIAGNOSIS: SEQUENCING AMBIGUITY DETECTED", diagnosisText: `Paralysis detected for "${taskName}". The cognitive runway is obscured because the first physical step is undefined.`, interventionLabel: "INTERVENTION_01: FIVE-MINUTE BRAIN DUMP", interventionSteps: ["Set a physical timer for exactly 300 seconds.", "Write down every worry or task fragment on a blank page.", "Select the single most basic physical action.", "Execute that single action with disregard for quality."] },
    "2": { blockType: "FEAR", diagnosisTitle: "SYSTEM DIAGNOSIS: PERFECTIONISM PARALYSIS", diagnosisText: `Threat levels have triggered an amygdala hijack on "${taskName}". You are treating a mediocre outcome as a fatal threat.`, interventionLabel: "INTERVENTION_02: QUANTIZED SLOPPY DRAFTING", interventionSteps: ["Commit to a 'terrible' version for 15 minutes.", "No backspaces, no editing, just output.", "Editing is trivial, conjuring material is where friction lives.", "Produce 2 pages of pure draft without reading back."] },
    "3": { blockType: "FRICTION", diagnosisTitle: "SYSTEM DIAGNOSIS: COGNITIVE RESISTANCE SPIKE", diagnosisText: `Environmental friction for "${taskName}" is too high. Your brain is seeking low-effort dopamine.`, interventionLabel: "INTERVENTION_03: HYPER-LOCAL NOISE BLOCKOUT", interventionSteps: ["Enter fullscreen, mute phone, close tabs.", "Select a repetitive low-tempo track to loop.", "Define a strict 10-minute micro-boundary.", "Evaluate if momentum has established after 10 minutes."] },
    "4": { blockType: "FAKE", diagnosisTitle: "SYSTEM DIAGNOSIS: VALUE-REWARD MISALIGNMENT", diagnosisText: `The motivation system has flagged "${taskName}" as an artificial threat with no real reward.`, interventionLabel: "INTERVENTION_04: META-REWARD LINKING", interventionSteps: ["Reframe: this is an athletic training session for your stamina.", "Decide on a tangible reward to consume after this block.", "Connect this task to a macro goal.", "Launch session with a clean, high-intensity sprint."] }
  };
  return fallbacks[code] || fallbacks["1"];
}

function getFallbackOptimization(tasks: any[]) {
  const optimized = tasks.map((t: any) => {
    if (t.name?.toLowerCase().includes("research") || t.name?.toLowerCase().includes("study")) {
      return { ...t, day: 4, startHour: 14, reason: "Redistributed to Friday afternoon to balance load." };
    }
    return t;
  });
  return { optimizedTasks: optimized, strategyText: "Burnout mitigation strategy applied. Moved high-intensity blocks to Friday afternoon." };
}

function getFallbackSuggestions() {
  return { suggestions: [
    { title: "DEEP WORK: CALCULUS", type: "HIGH_EFFICIENCY", confidence: 92, day: 0, startHour: 19, durationHours: 2.5, timeString: "MON 19:00 - 21:30" },
    { title: "BUFFER_GAP_INIT", type: "RECOVERY", confidence: 78, day: 2, startHour: 13, durationHours: 2, timeString: "WED 13:30 - 15:30" }
  ]};
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
