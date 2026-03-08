/**
 * MCP Tools for the Proposal Deck agent.
 * The agent decides when to fetch images and create diagrams.
 */

import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { generateSlideImage, buildImageQuery } from "./image-gen";
import { generateDiagramSvg, type DiagramType } from "./diagrams";

// Store generated assets in memory for the current job
const assetStore = new Map<string, { type: "image" | "diagram"; data: Buffer; mimeType: string }>();

export function clearAssets() {
  assetStore.clear();
}

export function getAsset(id: string) {
  return assetStore.get(id);
}

export function getAllAssets() {
  return Object.fromEntries(assetStore.entries());
}

export const deckToolsServer = createSdkMcpServer({
  name: "deck-tools",
  version: "1.0.0",
  tools: [
    tool(
      "fetch_image",
      "Fetch a relevant stock photo for a slide. Use this when a slide would benefit from a visual — hero images, team photos, product shots, etc. Returns an asset ID to reference in the slide.",
      {
        slideTitle: z.string().describe("Title of the slide this image is for"),
        imageDescription: z.string().describe("What the image should show — be specific (e.g. 'diverse team in modern office' not just 'team')"),
      },
      async (args) => {
        try {
          const query = buildImageQuery(args.slideTitle, args.imageDescription);
          const imageBuffer = await generateSlideImage(query);

          if (!imageBuffer) {
            return {
              content: [{ type: "text", text: "Image fetch failed — skip image for this slide and use text-only layout." }],
            };
          }

          const assetId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          assetStore.set(assetId, { type: "image", data: imageBuffer, mimeType: "image/jpeg" });

          return {
            content: [{ type: "text", text: `Image fetched successfully. Asset ID: ${assetId}. Reference this in the slide's "imageAssetId" field.` }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: `Image fetch error: ${error.message}. Skip image for this slide.` }],
          };
        }
      }
    ),

    tool(
      "create_diagram",
      "Create a professional business diagram for a slide. Use for timelines, process flows, metrics displays, pyramids, funnels, and comparisons. Returns an asset ID.",
      {
        diagramType: z.enum(["timeline", "process", "comparison", "metrics", "pyramid", "funnel"]).describe("Type of business diagram"),
        title: z.string().optional().describe("Diagram title (optional)"),
        items: z.array(z.string()).describe("Items for the diagram. For metrics, use 'value: label' format (e.g. '$2M: Revenue'). For comparison, first half = before, second half = after."),
        accentColor: z.string().optional().describe("Hex color for the diagram accent (defaults to slide style)"),
      },
      async (args) => {
        try {
          const colors = {
            accent: args.accentColor || "#4f46e5",
            accentLight: args.accentColor ? args.accentColor + "aa" : "#818cf8",
            bg: "#1a1a2e",
            text: "#ffffff",
            muted: "#a0a0b8",
          };

          const svg = generateDiagramSvg(
            args.diagramType as DiagramType,
            args.items,
            colors,
            args.title
          );

          const assetId = `diag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          assetStore.set(assetId, { type: "diagram", data: Buffer.from(svg, "utf-8"), mimeType: "image/svg+xml" });

          return {
            content: [{ type: "text", text: `Diagram created successfully. Asset ID: ${assetId}. Reference this in the slide's "diagramAssetId" field.` }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: `Diagram creation error: ${error.message}. Use bullet points instead.` }],
          };
        }
      }
    ),
  ],
});
