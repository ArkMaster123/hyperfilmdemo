# DigiForge

## What This Is

A demo application that uses the Claude Agent SDK to automatically generate digital product templates — the same types of assets sold on digi-vault.co (prompt guides, proposal decks, email templates, icon packs, motion graphics, etc.). Built for a business owner who wants to replace manual agency work with AI-powered workflows. Each product type is a self-contained "skill" agent, and the system is templateized so new product types can be added as simple config.

## Core Value

A business owner can pick a digital product type, provide minimal inputs, and receive a complete, professional, downloadable asset — generated entirely by AI agents.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Claude Agent SDK orchestrator that routes user requests to the correct skill agent
- [ ] Templateized skill system — each product type is a skill with input schema, prompt template, and output pipeline
- [ ] 7 product skills spanning easy/medium/hard difficulty for Steve's demo evaluation
- [ ] Easy: Prompt Guide Generator (topic + platform → styled HTML/PDF)
- [ ] Easy: Email Template Pack (business type + purpose → HTML email templates)
- [ ] Easy: Social Media Content Calendar (brand + platform + duration → structured content plan)
- [ ] Medium: Proposal Deck Generator (company + purpose + key points → downloadable .PPTX)
- [ ] Medium: Brand Guidelines Kit (brand name + industry + values → HTML brand book with colors, typography, usage rules)
- [ ] Hard: Icon Pack Generator (style + theme + count → AI-generated PNG images via Replicate)
- [ ] Hard: Motion Graphics Library (use case like YouTube/TikTok → SVG animations + Lottie specs)
- [ ] Clean, modern UI — product type grid, simple input forms, real-time generation progress, preview + download
- [ ] All outputs are downloadable and editable (HTML exportable, PPTX editable in Google Slides/PowerPoint)

### Out of Scope

- User accounts / authentication — this is a demo, not a SaaS product
- Payment processing — no commerce, just generation
- Full 461-product catalog — demo covers 7 representative types
- Mobile app — web-only demo
- Video generation — motion graphics will be SVG/Lottie animations, not rendered video

## Context

- Client is Auws Al-Gaboury (Hyper Film), creative producer who runs digi-vault.co selling 461+ digital products
- Steve Brownlie is evaluating whether AI can replace manual creation of these products
- Demo needs 5-10 tasks at easy/medium/hard difficulty to fairly evaluate AI capabilities
- Products must be "downloadable and editable with WordPress or Google Slides"
- Reference shop: https://www.digi-vault.co/category/all-products
- Product categories on digi-vault: fonts, email templates, AI prompt packs, icon sets, presentations, brand assets, social media templates, motion graphics

## Constraints

- **Tech stack**: Claude Agent SDK in TypeScript — non-negotiable per client request
- **Framework**: Next.js + React for the frontend
- **UI**: shadcn/ui + Tailwind CSS for polished, professional look
- **PPTX generation**: pptxgenjs library for PowerPoint file creation
- **Image generation**: Replicate API for AI-generated icons/assets
- **Demo scope**: 7 product skills (3 easy, 2 medium, 2 hard)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + shadcn/ui for frontend | Modern, polished, fast to build — avoids generic AI demo look | — Pending |
| Claude Agent SDK as orchestrator | Client requirement — proper agent architecture, not just API calls | — Pending |
| pptxgenjs for deck generation | Produces real .pptx files editable in Google Slides/PowerPoint | — Pending |
| Replicate for image generation | Best API for AI image generation, supports multiple models | — Pending |
| SVG/Lottie for motion graphics | Achievable with AI, actually editable, no video rendering needed | — Pending |
| Skill-per-product architecture | Templateized — adding new product = new skill config, not new code | — Pending |

---
*Last updated: 2026-03-08 after initialization*
