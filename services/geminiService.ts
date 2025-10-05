
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn(
    "API_KEY is not set. AI features will not be available. Please set the API_KEY environment variable."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Suggests a title for a given block of markdown content.
 * @param content The markdown content of the wiki page.
 * @returns A promise that resolves to a suggested title string.
 */
export const suggestTitle = async (content: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!content.trim()) {
    return "";
  }
  
  const prompt = `Based on the following markdown content, suggest a concise and appropriate title for this wiki page. Return only the title text, without any quotation marks or additional explanations.

---
CONTENT:
${content}
---

SUGGESTED TITLE:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // A lower temperature is better for deterministic, factual tasks.
        temperature: 0.2,
        maxOutputTokens: 20,
        // When using maxOutputTokens with gemini-2.5-flash, a thinkingBudget is required
        // to reserve some tokens for the final output.
        thinkingConfig: { thinkingBudget: 5 },
      }
    });
    
    const suggestedTitle = response.text?.trim();

    if (!suggestedTitle) {
      throw new Error("The AI returned an empty suggestion. The content might be inappropriate or the request failed.");
    }

    // Clean up any potential markdown or quotes
    return suggestedTitle.replace(/["'*`#]/g, '');

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a suggestion from the AI. Please check your API key and network connection.");
  }
};
