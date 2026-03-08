/**
 * Image service for slide images.
 * Uses Gemini 2.5 Flash Image (Nano Banana) — cheapest image gen model.
 * Falls back to Unsplash stock photos if Gemini fails.
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

/**
 * Generate a relevant image for a presentation slide.
 * Uses Gemini 2.5 Flash Image, falls back to Unsplash.
 */
export async function generateSlideImage(
  prompt: string
): Promise<Buffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `Create a professional, clean business presentation image for: ${prompt}. Modern, minimal style. No text overlays. 16:9 composition.`,
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    return await fetchStockImage(prompt);
  } catch (error) {
    console.error("[image-gen] Gemini failed, using Unsplash:", (error as Error).message);
    return await fetchStockImage(prompt);
  }
}

/**
 * Fetch a stock image from Unsplash source (fallback, no API key needed).
 */
async function fetchStockImage(query: string): Promise<Buffer | null> {
  try {
    const sanitized = encodeURIComponent(
      query.replace(/[^a-zA-Z0-9 ]/g, " ").trim()
    );
    const url = `https://source.unsplash.com/800x450/?${sanitized}`;

    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 1024) return null;
    return buffer;
  } catch {
    return null;
  }
}

/**
 * Map slide topics to good image search terms.
 */
export function buildImageQuery(
  slideTitle: string,
  slideContext: string
): string {
  const combined = `${slideTitle} ${slideContext}`.toLowerCase();

  const mappings: [RegExp, string][] = [
    [/team|people|culture|hiring/, "business team office"],
    [/growth|revenue|scale|profit/, "business growth chart"],
    [/technolog|ai|machine|software|digital/, "technology innovation"],
    [/market|customer|audience|user/, "market research"],
    [/strategy|plan|roadmap|vision/, "business strategy"],
    [/product|launch|release|feature/, "product launch"],
    [/data|analytics|metrics|dashboard/, "data analytics"],
    [/finance|funding|invest|capital/, "finance investment"],
    [/design|creative|brand|visual/, "creative design"],
    [/global|world|international/, "global business"],
    [/partner|collaborat|alliance/, "business partnership"],
    [/security|protect|safe/, "cybersecurity"],
    [/cloud|server|infrastructure/, "cloud computing"],
  ];

  for (const [pattern, q] of mappings) {
    if (pattern.test(combined)) return q;
  }

  return `business ${slideTitle.split(" ").slice(0, 3).join(" ")}`;
}
