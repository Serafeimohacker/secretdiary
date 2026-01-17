
import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, AIInsight } from "../types";

export const analyzeEntries = async (entries: JournalEntry[]): Promise<AIInsight | null> => {
  if (entries.length === 0) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const journalContext = entries
    .slice(0, 7) // Last 7 entries for context
    .map(e => `Date: ${e.date}, Mood: ${e.mood}, Content: ${e.text}`)
    .join('\n---\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following journal entries and provide emotional insights. Return a JSON object with a summary, dominant mood, a few recommendations for mental wellness, and a focus area for growth.\n\nEntries:\n${journalContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief, empathetic summary of the user's recent emotional state." },
            dominantMood: { type: Type.STRING, description: "The overarching emotional theme." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable tips for the user."
            },
            growthFocus: { type: Type.STRING, description: "One specific thing to reflect on or work on tomorrow." }
          },
          required: ["summary", "dominantMood", "recommendations", "growthFocus"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};
