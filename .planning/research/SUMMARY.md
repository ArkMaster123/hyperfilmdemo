# Project Research Summary

**Project:** DigiForge -- AI-Powered Digital Product Template Generator
**Domain:** AI-powered multi-agent file generation (demo app for client evaluation)
**Researched:** 2026-03-08
**Confidence:** MEDIUM

## Executive Summary

DigiForge is a demo application that must convince a client (Steve Brownlie of digi-vault.co) that AI can replace manual creation of digital products -- pitch decks, brand kits, email templates, icon packs, and more. The proven approach is a Next.js full-stack app with a flat agent architecture: a TypeScript orchestrator routes requests to individual Claude-powered skill agents, each with a focused system prompt. File generation uses battle-tested libraries (pptxgenjs for PPTX, Puppeteer for PDF, Replicate for images). The architecture is deliberately simple -- two levels max, one Claude API call per skill -- because agent hierarchy over-engineering is the single most common failure mode in this domain.

The recommended build order is pipeline-first: get the input-form-to-download flow working end-to-end with one trivial skill (Prompt Guide), then plug in additional skills incrementally. Easy skills (HTML output) first, medium skills (PPTX) second, hard skills (image/animation generation) last and only if time allows. The demo should showcase 3-4 polished skills rather than 7 rough ones. Quality of output matters far more than breadth of capability -- Steve needs to think "this could replace my agency," not "look at all these half-working features."

The top risks are: (1) generation latency killing the demo impression -- mitigate with streaming progress UI and pre-generated hero examples; (2) PPTX output looking amateurish -- mitigate with rigid slide templates, not dynamic layout; (3) hard skills (Icon Pack, Motion Graphics) consuming disproportionate development time for uncertain payoff -- mitigate by building them last with clear fallback plans and willingness to cut them. The meta-risk is optimizing for technical capability instead of impression quality.

## Key Findings

### Recommended Stack

The stack centers on Next.js 15 (App Router, Server Components) with TypeScript, the Anthropic SDK for Claude API calls, and shadcn/ui + Tailwind CSS for the frontend. File generation uses specialized libraries per output format. All AI generation uses Claude Sonnet for cost/speed balance.

**Core technologies:**
- **Next.js 15 + React 19:** Full-stack framework with App Router, Route Handlers for API, streaming support via SSE
- **@anthropic-ai/sdk:** Direct Claude API access with tool use and streaming. The higher-level Agent SDK (@anthropic-ai/claude-code-sdk) needs verification before adopting -- fallback is a simple tool-use while-loop
- **pptxgenjs:** Only viable Node.js library for programmatic PPTX generation. No real alternatives.
- **Puppeteer:** HTML-to-PDF via headless Chromium. WYSIWYG rendering, one-line API. Needs @sparticuz/chromium for serverless deployment.
- **Replicate:** Multi-model image generation API for Icon Pack skill. Pay-per-use, no GPU infra needed.
- **shadcn/ui + Tailwind CSS:** Component library with accessible primitives. Tailwind v3 vs v4 compatibility with shadcn needs verification at setup time.
- **Zod:** Schema validation driving both form rendering and API input validation -- single source of truth per skill.

**Critical version checks before install:** Tailwind v3 vs v4 compatibility with shadcn/ui; existence and stability of @anthropic-ai/claude-code-sdk; current Replicate model availability and pricing.

### Expected Features

**Must have (table stakes):**
- Real file downloads in native formats (PPTX, HTML, PNG) -- not screenshots
- Editable outputs that open correctly in Google Slides, email clients, browsers
- Professional visual quality that doesn't scream "AI generated"
- Minimal input (3-5 fields per skill), one-click generation
- Live generation progress with streaming status updates
- In-browser preview before download
- Product type selection grid showing all available skills

**Should have (differentiators):**
- Brand consistency across products (shared brand context)
- Variation generation ("generate 3 options")
- Generation time + cost display ("47 seconds, $0.03") for the ROI argument
- Edit-and-regenerate without starting over

**Defer (v2+):**
- User accounts, auth, payments
- Drag-and-drop editor, template marketplace
- Batch generation across all skills
- Mobile responsive design
- AI chat interface for refinement

**Anti-features (explicitly do NOT build):**
- No auth, no payments, no version history, no collaborative editing
- No AI model selection UI, no complex style customization
- No mobile optimization -- desktop demo only

### Architecture Approach

Flat, two-level architecture: a TypeScript orchestrator function (NOT a Claude agent) routes to individual skill agents. Each skill is a self-contained config object in a registry (input schema, system prompt, output format, pipeline function). Adding a new skill means adding one config file. The orchestrator is a Map lookup, not an AI call. Jobs run asynchronously with progress streamed via SSE through an in-memory JobStore. Files are saved to disk, served via download route.

**Major components:**
1. **Skill Registry** -- Map of skill configs (schema, prompt, pipeline); new skills are pure config
2. **Orchestrator** -- TypeScript function that validates input, dispatches to skill agent, runs output pipeline
3. **Skill Executor** -- Single Claude API call per skill with streaming; retry logic for rate limits and transient errors
4. **Job Store** -- In-memory event buffer decoupling agent execution from SSE streaming to frontend
5. **Output Pipelines** -- Format-specific converters (HTML wrapper, pptxgenjs builder, Replicate caller, archiver for ZIPs)
6. **Frontend** -- Product grid, dynamic form (rendered from Zod schema), SSE progress panel, download button

### Critical Pitfalls

1. **Demo latency kills the impression (CP-1)** -- Generation takes 30-90s. Mitigate with streaming progress UI, pre-generated hero examples, and hard 60s timeout with partial results. This is architectural -- must be in Phase 1.

2. **PPTX output looks amateurish (CP-2)** -- pptxgenjs gives low-level positioning primitives with no design intelligence. Mitigate with 3-5 rigid slide templates (tested in Google Slides), curated color palettes, web-safe fonts only, character limits per text zone. Do NOT let AI decide layout positioning.

3. **Agent hierarchy over-engineering (CP-5)** -- Building 5-level agent hierarchies doubles development time, multiplies latency, and explodes token costs. Mitigate with flat 2-level max architecture. Total Claude API calls per generation: 1-3, not 5-10.

4. **Icon Pack cost explosion and inconsistency (CP-3)** -- 10 icons x $0.01-0.10 each x many iterations = hundreds of dollars before demo. Mitigate with budget caps, caching, 6-icon limit, consistent style prefix prompts, pre-generated fallback packs.

5. **Motion Graphics scope is unrealistic (CP-4)** -- Claude cannot reliably generate complex Lottie JSON or multi-element SVG animations. Mitigate by reducing scope to "animated SVG elements" using CSS animation templates with AI-customized parameters. Skip Lottie for the demo.

## Implications for Roadmap

### Phase 1: Foundation + Pipeline Skeleton
**Rationale:** Everything depends on the input-to-download pipeline. Without it, no skill can be demonstrated. Architecture decisions here (flat agents, SSE streaming, Job Store) prevent the most critical pitfalls.
**Delivers:** Working end-to-end flow -- skill registry, orchestrator, job store, SSE streaming, file storage, API routes, frontend shell (product grid, form, progress panel, download)
**Addresses:** Live generation progress, one-click generation, product type selection grid
**Avoids:** CP-5 (over-engineered agents), MP-1 (timeout/memory), CP-1 (no progress feedback)
**Stack:** Next.js, Anthropic SDK, Zod, shadcn/ui, nanoid

### Phase 2: Easy Skills (HTML Output)
**Rationale:** Lowest risk skills that validate the pipeline with real content. HTML output is the simplest pipeline. Proves Claude can generate professional content.
**Delivers:** Prompt Guide Generator, Email Template Pack, Social Media Content Calendar -- all producing downloadable HTML
**Addresses:** Real file downloads, editable outputs, professional visual quality, preview before download
**Avoids:** MP-2 (HTML/CSS compatibility -- table-based email layout, inline CSS), mP-2 (calendar as "just ChatGPT" -- needs styled visual output)
**Stack:** HTML pipeline, Puppeteer (for PDF option), archiver (for multi-file ZIP)

### Phase 3: Medium Skills (PPTX + Brand Kit)
**Rationale:** PPTX is the highest-impact demo moment ("it makes real PowerPoints!") but needs the template system built carefully. Brand Kit is structured content with visual design elements.
**Delivers:** Proposal Deck Generator (PPTX), Brand Guidelines Kit (HTML)
**Addresses:** File format output diversity, professional design quality
**Avoids:** CP-2 (amateurish PPTX -- rigid templates, tested in Google Slides), MP-5 (font licensing -- web-safe fonts only), mP-3 (bad colors -- curated palettes)
**Stack:** pptxgenjs, PPTX pipeline, curated slide templates

### Phase 4: Hard Skills (Image + Animation)
**Rationale:** Highest risk, highest wow-factor. Built last so they can be cut without affecting the core demo. Each has a fallback plan.
**Delivers:** Icon Pack Generator (PNG images via Replicate), Motion Graphics (CSS-animated SVGs with templates)
**Addresses:** AI image generation capability, animation capability
**Avoids:** CP-3 (icon cost/inconsistency -- budget caps, caching, 6-icon limit), CP-4 (motion graphics scope -- CSS animation templates, no Lottie)
**Stack:** Replicate API, sharp, SVG + CSS animations

### Phase 5: Polish + Demo Hardening
**Rationale:** Quality variance across runs is a real risk (MP-3). Pre-demo hardening ensures Steve sees the best output, not a random bad run.
**Delivers:** Low temperature settings, output validation gates, pre-generated hero examples, error boundaries, retry buttons, generation time/cost display, variation generation
**Addresses:** Differentiator features (time/cost display, variations), demo reliability
**Avoids:** MP-3 (quality variance), MP-6 (no graceful degradation), demo-day operational risks

### Phase Ordering Rationale

- **Pipeline before skills:** The dependency chain is clear -- input form, agent execution, preview, download must all work before any individual skill matters. Building pipeline-first with the simplest skill (Prompt Guide) validates the entire architecture.
- **Easy before hard:** Easy skills prove the concept with minimal risk. If the easy skills impress Steve, the demo succeeds even without hard skills. Hard skills are optional upside.
- **PPTX gets its own phase:** The slide template system (CP-2) is a significant sub-project. Grouping it with brand guidelines (similar visual design concerns) makes sense.
- **Polish is a dedicated phase:** Output quality variance (MP-3) and graceful degradation (MP-6) need systematic attention, not ad-hoc fixes. Pre-generated hero examples are demo insurance.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1:** Verify Anthropic SDK streaming API surface (client.messages.stream() event names); confirm @anthropic-ai/claude-code-sdk existence; resolve Tailwind v3 vs v4 with shadcn/ui
- **Phase 3 (PPTX):** pptxgenjs API verification needed -- layout positioning, write() options, font embedding. Slide template design requires iteration.
- **Phase 4 (Icons):** Replicate API current pricing, available models (SDXL vs Flux), cold start behavior. Style consistency prompting techniques need experimentation.

**Phases with standard patterns (skip deep research):**
- **Phase 2 (Easy skills):** HTML generation, email template patterns, and CSS styling are well-documented. Email HTML quirks (table layout) are well-known.
- **Phase 5 (Polish):** Error boundaries, SSE reconnection, pre-caching -- all standard web engineering patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Library choices are sound but specific versions unverified. Tailwind v3/v4 and Agent SDK existence are open questions. |
| Features | HIGH | Feature priorities are well-grounded in PROJECT.md requirements and standard demo strategy. Anti-features list is clear. |
| Architecture | MEDIUM-HIGH | Patterns are established (skill registry, SSE streaming, flat agents). Anthropic SDK streaming API shape needs verification. |
| Pitfalls | HIGH | Pitfalls are well-documented across the industry. PPTX layout issues, agent over-engineering, and demo latency are universal. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Agent SDK verification:** Confirm whether @anthropic-ai/claude-code-sdk exists and is stable, or commit to the manual tool-use loop pattern. Decision needed before Phase 1 implementation.
- **Tailwind version:** Check shadcn/ui compatibility with Tailwind v4 at setup time. Pin v3.4.x if needed.
- **Replicate pricing and models:** Current per-image costs and available models (especially Flux) need verification before budgeting Phase 4.
- **Puppeteer deployment:** If deploying to Vercel, @sparticuz/chromium is required. If self-hosting, full Puppeteer works. Deployment target decision affects Phase 2.
- **Lottie feasibility:** Motion Graphics skill may need to be pure CSS-animated SVG with no Lottie at all. Verify @lottiefiles/lottie-js API before committing to Lottie output.
- **Model naming:** Verify current Claude model identifiers (claude-sonnet-4-20250514 vs potential newer naming) before implementation.

## Sources

### Primary (HIGH confidence)
- PROJECT.md -- project requirements, client context, constraints
- Training data knowledge of Next.js App Router, Zod, SSE patterns, pptxgenjs, email HTML patterns

### Secondary (MEDIUM confidence)
- Anthropic TypeScript SDK documentation (training data, pre-May 2025)
- pptxgenjs API and capabilities (training data)
- Replicate API patterns (training data)
- shadcn/ui component library patterns (training data)

### Tertiary (LOW confidence)
- @anthropic-ai/claude-code-sdk -- may not exist or may be renamed
- Tailwind CSS v4 compatibility with shadcn/ui -- evolving rapidly
- Replicate model availability and pricing -- changes frequently
- @lottiefiles/lottie-js API -- insufficient verification

---
*Research completed: 2026-03-08*
*Ready for roadmap: yes*
