# Technology Stack

**Project:** DigiForge -- AI-Powered Digital Product Template Generator
**Researched:** 2026-03-08
**Verification Note:** WebSearch, Bash, and WebFetch were unavailable during this research session. Version numbers are based on training data (cutoff ~May 2025) and MUST be verified before `npm install`. Confidence levels reflect this limitation.

---

## Recommended Stack

### Core AI Layer

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `@anthropic-ai/sdk` | ^0.39.x | Anthropic API client -- direct Claude API calls | The standard Anthropic TypeScript SDK. Provides `messages.create()` with tool use, streaming, and structured outputs. This is the foundation for all agent logic. | MEDIUM -- verify latest on npm |
| `@anthropic-ai/claude-code-sdk` | ^0.1.x | Claude Agent SDK -- multi-agent orchestration | Provides higher-level agent primitives: agent loops, tool registration, multi-turn conversations. Use this if the package exists and is stable; otherwise fall back to building agent orchestration on top of `@anthropic-ai/sdk` directly with tool-use loops. | LOW -- verify this package exists and is not renamed |

**IMPORTANT:** The "Claude Agent SDK" naming has been fluid. At the time of writing:
- `@anthropic-ai/sdk` is the confirmed, stable TypeScript SDK for Claude API access with tool use.
- A higher-level "Agent SDK" may exist as `@anthropic-ai/claude-code-sdk` or similar. **Verify on npm before committing to it.**
- If no stable agent SDK exists, the agent orchestration pattern is straightforward to build: a while-loop that calls `messages.create()` with tools, processes tool calls, and feeds results back until the model produces a final text response.

**Fallback agent pattern (if no Agent SDK):**
```typescript
// Agent loop built on @anthropic-ai/sdk
async function runAgent(systemPrompt: string, userMessage: string, tools: Tool[]) {
  let messages = [{ role: 'user', content: userMessage }];
  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: systemPrompt,
      messages,
      tools,
      max_tokens: 4096,
    });
    if (response.stop_reason === 'end_turn') return response;
    // Process tool_use blocks, execute tools, append tool_result
    messages = [...messages, { role: 'assistant', content: response.content }];
    for (const block of response.content.filter(b => b.type === 'tool_use')) {
      const result = await executeTool(block.name, block.input);
      messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: block.id, content: result }] });
    }
  }
}
```

### Frontend Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `next` | ^15.x | Full-stack React framework | App Router with Server Components, Route Handlers for API endpoints, streaming support for real-time generation progress. Non-negotiable per project constraints. | MEDIUM -- 15.x was current as of training; may be 15.1+ or 16.x by now |
| `react` / `react-dom` | ^19.x | UI rendering | React 19 ships with Next.js 15. Server Components are default. | MEDIUM |
| `typescript` | ^5.6+ | Type safety | Non-negotiable. Strict mode. | HIGH |

### UI Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `shadcn/ui` | latest (CLI-installed) | Component library | Not an npm dependency -- components are copied into your project via `npx shadcn@latest add`. Provides polished, accessible, customizable primitives built on Radix UI + Tailwind CSS. Perfect for a professional demo UI. | MEDIUM |
| `tailwindcss` | ^4.x | Utility CSS | Tailwind v4 shipped in early 2025 with new CSS-first config. Check if shadcn/ui supports v4 yet; may need to pin v3.4.x if not. | LOW -- v4 compatibility with shadcn needs verification |
| `lucide-react` | ^0.460+ | Icons | Default icon set for shadcn/ui. Consistent, clean. | MEDIUM |
| `@radix-ui/*` | various | Headless UI primitives | Installed automatically by shadcn/ui components. | HIGH |

**Tailwind version decision:** If shadcn/ui does not yet fully support Tailwind v4, use Tailwind v3.4.x. Check the shadcn/ui docs at setup time.

### File Generation Libraries

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `pptxgenjs` | ^3.12+ | PowerPoint (.pptx) generation | The dominant Node.js library for creating PPTX files. Produces real Office XML that opens in PowerPoint, Google Slides, and Keynote. Supports slides, text, images, charts, tables, shapes. Well-maintained, 3k+ GitHub stars. No serious competitor. | MEDIUM |
| `puppeteer` | ^23.x | HTML-to-PDF conversion | Headless Chromium renders HTML to pixel-perfect PDF. Better quality than wkhtmltopdf or jsPDF for complex layouts. Use for Prompt Guides and Brand Guidelines. | MEDIUM |
| `@lottiefiles/lottie-js` | ^0.4+ | Lottie animation creation | Programmatic Lottie JSON construction. For the Motion Graphics skill. | LOW -- verify this API is sufficient for programmatic creation |
| `sharp` | ^0.33+ | Image processing | Resize, composite, format conversion for generated images. Fast, native bindings. | HIGH |

### AI Image Generation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `replicate` | ^1.x | Replicate API client | Access to SDXL, Flux, and other image models via simple API. Pay-per-use, no GPU infrastructure. Best option for a demo: fast setup, multiple model options. | MEDIUM |

**Replicate model recommendations for icon generation:**
- `stability-ai/sdxl` -- Good general-purpose, consistent style
- `black-forest-labs/flux-1.1-pro` -- Higher quality, newer model (verify availability)
- Use structured prompts: "flat icon, [style], [subject], transparent background, SVG-ready"

**Alternative considered: OpenAI DALL-E 3 via API**
- Also viable, simpler API, but less model choice
- Replicate wins because you can switch models without code changes

### Server-Side Utilities

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `zod` | ^3.23+ | Schema validation | Validate user inputs for each skill agent. Define input schemas declaratively. Integrates with TypeScript types. | HIGH |
| `nanoid` | ^5.x | ID generation | Short, URL-safe unique IDs for generated assets and job tracking. | HIGH |
| `archiver` | ^7.x | ZIP file creation | Bundle multi-file outputs (icon packs, email template sets) into downloadable ZIPs. | MEDIUM |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `eslint` | ^9.x | Linting | Flat config format in v9. | MEDIUM |
| `prettier` | ^3.x | Formatting | Consistent code style. | HIGH |
| `@types/node` | ^22.x | Node.js types | Match the Node.js version. | MEDIUM |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| AI SDK | `@anthropic-ai/sdk` | Vercel AI SDK (`ai`) | Vercel AI SDK adds abstraction over multiple providers. We only use Claude (project constraint), so the Anthropic SDK is simpler and more direct. Vercel AI SDK is worth considering only if you want provider-agnostic tool-use abstractions. |
| PPTX | `pptxgenjs` | `officegen`, `docx` | `officegen` is unmaintained. `docx` is for Word docs only. `pptxgenjs` is the only actively maintained PPTX generator for Node.js. |
| PDF | `puppeteer` | `jspdf`, `pdfkit`, `wkhtmltopdf` | `jspdf` is client-side and struggles with complex HTML layouts. `pdfkit` requires building PDFs programmatically (no HTML input). `wkhtmltopdf` uses QtWebKit (outdated rendering). Puppeteer uses real Chromium -- WYSIWYG. |
| PDF (alt) | `puppeteer` | `@playwright/test` | Playwright also does PDF generation but is heavier. For just PDF rendering, Puppeteer is simpler. |
| Image gen | Replicate | OpenAI DALL-E, Midjourney API | DALL-E is viable but single-model. Midjourney has no official API. Replicate gives access to many models with one integration. |
| Image gen | Replicate | Self-hosted Stable Diffusion | Requires GPU infrastructure. Overkill for a demo. |
| CSS framework | Tailwind CSS | CSS Modules, styled-components | shadcn/ui requires Tailwind. Non-negotiable once you choose shadcn. |
| Animation | Lottie JSON | CSS animations, GIF generation | Lottie is editable, lightweight, and industry-standard for motion graphics. CSS animations aren't exportable. GIFs are heavy and lossy. |
| ZIP | `archiver` | `jszip` | `archiver` is more battle-tested for server-side Node.js streaming. `jszip` is more browser-oriented. Both work; `archiver` edges out for server use. |

---

## Architecture-Relevant Stack Decisions

### Why Not Vercel AI SDK

The Vercel AI SDK (`ai` package) provides a `useChat` hook and streaming UI primitives. It is tempting but wrong for this project:

1. **DigiForge is not a chat app.** Users pick a product type, fill a form, and get a file. There is no conversation.
2. **Tool use is the core pattern.** Each skill agent uses tools (generate_pptx, generate_image, etc.). The Anthropic SDK's tool-use API is more direct.
3. **Streaming is for progress, not chat.** We stream generation status updates, not token-by-token text. Server-Sent Events from a Route Handler is simpler than Vercel AI SDK's streaming abstractions.

**Exception:** If you want the `useChat` streaming UI for a "creative brief refinement" step where the user iterates on inputs with Claude, Vercel AI SDK's `useChat` is convenient. But it is optional, not foundational.

### PDF Generation: Puppeteer vs. Alternatives

For this project, HTML is the intermediate format for several products (Prompt Guides, Brand Guidelines, Email Templates). Converting HTML to PDF is a "last mile" concern.

**Puppeteer is the right choice because:**
- The HTML is already styled with Tailwind/custom CSS
- Puppeteer renders with real Chromium -- exact WYSIWYG
- `page.pdf()` is one line of code
- Supports headers, footers, page breaks via CSS `@media print`

**Deployment note:** Puppeteer requires Chromium (~400MB). On Vercel serverless, use `@sparticuz/chromium` (headless Chromium compiled for AWS Lambda). Or use a dedicated API route on a non-serverless deployment.

### Lottie: Programmatic Generation Approach

Lottie animations are JSON files with a specific schema. There are two approaches:

1. **Template-based (recommended):** Pre-build 10-15 Lottie templates for common motion graphics (text reveal, logo spin, slide-in, bounce, etc.). Claude agent fills in colors, text, timing, easing from user inputs. This is reliable and produces professional results.

2. **Fully generative:** Have Claude generate raw Lottie JSON. This is fragile -- Lottie JSON is complex (~1000 lines for simple animations) and Claude will likely produce invalid output. Not recommended.

**Use template-based approach.** The "hard" part is designing the templates, not the AI generation.

---

## Installation Plan

```bash
# Initialize Next.js project
npx create-next-app@latest digiforge --typescript --tailwind --eslint --app --src-dir

# Core AI
npm install @anthropic-ai/sdk

# File generation
npm install pptxgenjs puppeteer sharp archiver

# Utilities
npm install zod nanoid

# Image generation
npm install replicate

# Lottie (verify package name before install)
npm install lottie-web  # for preview/playback in browser
# For programmatic Lottie creation, may need @lottiefiles/lottie-js or manual JSON

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea tabs progress dialog

# Dev dependencies
npm install -D @types/archiver
```

**Puppeteer deployment note:** For Vercel/serverless:
```bash
npm install @sparticuz/chromium puppeteer-core
# Use puppeteer-core + @sparticuz/chromium instead of full puppeteer
```

---

## Version Verification Checklist

Before installing, verify these versions are current:

| Package | Verify At | What to Check |
|---------|-----------|---------------|
| `next` | npmjs.com/package/next | May be 15.x or 16.x |
| `@anthropic-ai/sdk` | npmjs.com/package/@anthropic-ai/sdk | Verify tool-use API shape |
| `@anthropic-ai/claude-code-sdk` | npmjs.com/package/@anthropic-ai/claude-code-sdk | Verify this package exists |
| `pptxgenjs` | npmjs.com/package/pptxgenjs | Likely still 3.12.x |
| `puppeteer` | npmjs.com/package/puppeteer | May be 23.x or 24.x |
| `replicate` | npmjs.com/package/replicate | Verify latest API patterns |
| `tailwindcss` | Check shadcn/ui docs for v3 vs v4 compatibility | Critical decision |
| `sharp` | npmjs.com/package/sharp | Likely 0.33.x |

---

## Model Selection

| Use Case | Recommended Model | Why |
|----------|-------------------|-----|
| Orchestrator (routing) | `claude-sonnet-4-20250514` | Fast, cheap, good at classification/routing. Does not need Opus-level reasoning. |
| Content generation (text-heavy skills) | `claude-sonnet-4-20250514` | Good balance of quality and speed for generating prompt guides, email templates, content calendars. |
| Complex generation (brand guidelines) | `claude-sonnet-4-20250514` | Sonnet handles structured creative output well. Upgrade to Opus only if quality is insufficient. |
| Image prompt engineering | `claude-sonnet-4-20250514` | Generates Replicate prompts for icon generation. Sonnet is sufficient. |

**Cost note:** For a demo app, Sonnet is the right default everywhere. Opus is 5x more expensive and only needed for extremely complex reasoning tasks, which this project does not have.

**Model name note:** Verify current model names at docs.anthropic.com. Model naming convention may have changed (e.g., `claude-4-sonnet` vs `claude-sonnet-4-20250514`).

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Required for Icon Pack skill
REPLICATE_API_TOKEN=r8_...

# Optional -- for Puppeteer in serverless
CHROME_EXECUTABLE_PATH=/path/to/chromium
```

---

## Sources and Confidence

| Source | Type | What It Informed |
|--------|------|------------------|
| Training data (pre-May 2025) | Pre-existing knowledge | All recommendations -- treated as hypothesis |
| PROJECT.md | Project file | Constraints, requirements |
| No live verification performed | -- | All versions are UNVERIFIED |

**Overall confidence: MEDIUM-LOW.** Recommendations are sound in direction (the right libraries, the right patterns) but specific version numbers and API shapes must be verified at install time. The core architectural choices (pptxgenjs for PPTX, Puppeteer for PDF, Replicate for images, template-based Lottie) are stable recommendations unlikely to have changed.
