import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

  const prompt = `A sleek, futuristic dark dashboard interface floating in space, showing multiple glowing holographic cards representing digital products — a presentation deck, email templates, brand guidelines, icons, and motion graphics. Each card has a subtle purple/indigo glow emanating from its edges. The scene has a deep dark navy background (#09090b) with subtle grid lines. Cinematic lighting from above, volumetric light rays in indigo and violet tones cutting through a slight haze. Ultra-modern, premium SaaS product aesthetic. 16:9 aspect ratio, photorealistic 3D render quality. No text overlays.`;

  console.log("Generating hero image with Nano Banana...");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync("public/hero.png", buffer);
        console.log(`Hero image saved! (${buffer.length} bytes)`);
        return;
      }
    }
  }

  console.error("No image generated");
}

main().catch(console.error);
