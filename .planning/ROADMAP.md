# Roadmap: DigiForge

## Overview

DigiForge delivers an AI-powered digital product generator demo in 5 phases, progressing from pipeline infrastructure through progressively harder skill implementations to final polish. The build order is pipeline-first (prove the architecture), easy skills (prove AI content quality), medium skills (prove file format diversity), hard skills (prove AI generation range), and polish (prove demo reliability). Every phase delivers a complete, demonstrable capability that builds on the previous one.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + Pipeline** - End-to-end input-to-download pipeline with one stub skill
- [ ] **Phase 2: Easy Skills (HTML Output)** - Prompt Guide, Email Templates, Content Calendar producing downloadable HTML
- [ ] **Phase 3: Medium Skills (PPTX + Brand Kit)** - Proposal Deck (.pptx) and Brand Guidelines Kit
- [ ] **Phase 4: Hard Skills (Image + Animation)** - Icon Pack (Replicate) and Motion Graphics (CSS-animated SVG)
- [ ] **Phase 5: Polish + Demo Hardening** - Output quality, error handling, pre-generated examples, demo reliability

## Phase Details

### Phase 1: Foundation + Pipeline
**Goal**: User can select a product type, fill an input form, trigger generation, see real-time progress, and download a generated file -- proving the entire pipeline works end-to-end
**Depends on**: Nothing (first phase)
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07
**Success Criteria** (what must be TRUE):
  1. User sees a product grid landing page with cards for each skill type, can click one, and sees a dynamic input form with 3-5 fields
  2. User clicks "Generate" and sees real-time streaming progress updates in a progress panel (not a spinner -- actual status messages)
  3. User sees an in-browser preview of the generated output and can download it as a real file
  4. A new skill can be added by creating a single config file with input schema, system prompt, and output pipeline -- no other code changes required
  5. The frontend is clean and professional (Next.js + shadcn/ui + Tailwind), desktop-optimized, with no broken layouts or placeholder UI
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js project setup, shadcn/ui, Tailwind, project structure, dev tooling
- [ ] 01-02: Skill registry, Zod schemas, orchestrator routing, skill executor with Claude API streaming
- [ ] 01-03: Job store, SSE streaming API route, file storage and download route
- [ ] 01-04: Frontend -- product grid, dynamic input forms, progress panel, preview panel, download button
- [ ] 01-05: Stub skill (Prompt Guide skeleton) to validate full pipeline end-to-end
- [ ] 01-06: Integration testing -- complete flow from grid selection through download

### Phase 2: Easy Skills (HTML Output)
**Goal**: User can generate three distinct HTML-based digital products (Prompt Guide, Email Templates, Content Calendar) with professional quality output
**Depends on**: Phase 1
**Requirements**: GUIDE-01, GUIDE-02, GUIDE-03, EMAIL-01, EMAIL-02, EMAIL-03, SOCIAL-01, SOCIAL-02, SOCIAL-03
**Success Criteria** (what must be TRUE):
  1. User inputs a topic and platform, and receives a styled HTML prompt guide with numbered prompts, tips, and platform-specific guidance -- downloadable and viewable in-browser
  2. User inputs business type, email purpose, and brand colors, and receives 3-5 responsive HTML email templates with inline CSS and table-based layout -- downloadable as a ZIP
  3. User inputs brand name, platforms, and duration, and receives a structured content calendar with post ideas, captions, hashtags, and posting schedule -- viewable as a styled calendar grid and downloadable as HTML
  4. All three outputs look professional (not generic AI text dumps) with proper formatting, colors, and visual hierarchy
**Plans**: TBD

Plans:
- [ ] 02-01: Prompt Guide Generator skill (system prompt, HTML output pipeline, styling)
- [ ] 02-02: Email Template Pack skill (system prompt, multi-file HTML output, table-based layout, ZIP pipeline)
- [ ] 02-03: Social Media Content Calendar skill (system prompt, calendar grid layout, HTML output)
- [ ] 02-04: HTML output pipeline hardening (consistent styling, preview rendering, download format validation)

### Phase 3: Medium Skills (PPTX + Brand Kit)
**Goal**: User can generate a real PowerPoint deck and a comprehensive brand guidelines document -- proving AI can produce professional business assets
**Depends on**: Phase 2
**Requirements**: DECK-01, DECK-02, DECK-03, DECK-04, BRAND-01, BRAND-02, BRAND-03, PIPE-07
**Success Criteria** (what must be TRUE):
  1. User inputs company name, proposal purpose, and key points, and receives an 8-12 slide .pptx file that opens correctly in Google Slides and PowerPoint with consistent design
  2. Slides have professional layouts with proper color palette, typography, spacing, and structure (title slide, content slides, closing slide) -- not amateur-looking auto-generated slides
  3. User inputs brand name, industry, and values, and receives a brand book with color palette (hex codes), typography recommendations, logo usage rules, and tone of voice -- viewable in-browser with visual design elements
  4. All outputs from this phase are editable -- PPTX editable in Google Slides/PowerPoint, HTML copy-pasteable and modifiable
**Plans**: TBD

Plans:
- [ ] 03-01: PPTX output pipeline (pptxgenjs integration, rigid slide templates, curated color palettes)
- [ ] 03-02: Proposal Deck Generator skill (system prompt, structured slide content generation, template mapping)
- [ ] 03-03: PPTX quality validation (test in Google Slides and PowerPoint, fix layout/font issues)
- [ ] 03-04: Brand Guidelines Kit skill (system prompt, HTML brand book with color swatches, font samples, do/don't examples)

### Phase 4: Hard Skills (Image + Animation)
**Goal**: User can generate AI-created icon packs and CSS-animated SVG motion graphics -- proving AI can produce visual and interactive assets
**Depends on**: Phase 3
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04, MOTION-01, MOTION-02, MOTION-03, MOTION-04
**Success Criteria** (what must be TRUE):
  1. User inputs style, theme, and count, and receives a set of consistent PNG icons with transparent backgrounds at 512x512+ resolution -- previewable as an image grid and downloadable as a ZIP
  2. Icons within a pack have visually consistent style (colors, line weight, perspective) -- they look like they belong together
  3. User inputs use case and style preference, and receives CSS-animated SVG elements (subscribe button animation, chart pop-up, etc.) with smooth easing and customizable colors
  4. Animations play in the browser preview and are downloadable as a ZIP of SVG files
**Plans**: TBD

Plans:
- [ ] 04-01: Replicate API integration (model selection, image generation, transparent background processing)
- [ ] 04-02: Icon Pack Generator skill (system prompt, style consistency prompting, batch generation, ZIP pipeline)
- [ ] 04-03: SVG animation output pipeline (CSS animation templates, color customization, preview rendering)
- [ ] 04-04: Motion Graphics Library skill (system prompt, use-case-specific animation generation, SVG output)
- [ ] 04-05: Image/animation quality validation (icon consistency, animation smoothness, browser compatibility)

### Phase 5: Polish + Demo Hardening
**Goal**: Every generation produces demo-worthy output reliably -- Steve sees polished results on every run, not random quality variance
**Depends on**: Phase 4
**Requirements**: (no new requirements -- hardens existing ones)
**Success Criteria** (what must be TRUE):
  1. Generation failures show a friendly error message with a retry button -- never a blank screen, stack trace, or hung spinner
  2. Pre-generated hero examples exist for each skill type so the demo can show impressive output even if live generation has issues
  3. Output quality is consistent across runs -- low temperature settings, output validation gates, and prompt refinement ensure professional results every time
  4. The complete demo flow (landing page, select skill, fill form, generate, preview, download) works smoothly for all 7 skills without jarring transitions or broken states
**Plans**: TBD

Plans:
- [ ] 05-01: Error boundaries, retry buttons, graceful degradation for all failure modes
- [ ] 05-02: Pre-generated hero examples for each skill type (fallback and demo insurance)
- [ ] 05-03: Output quality tuning (temperature, prompt refinement, validation gates per skill)
- [ ] 05-04: End-to-end demo walkthrough testing and UX polish across all 7 skills

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation + Pipeline | 0/6 | Not started | - |
| 2. Easy Skills (HTML Output) | 0/4 | Not started | - |
| 3. Medium Skills (PPTX + Brand Kit) | 0/4 | Not started | - |
| 4. Hard Skills (Image + Animation) | 0/5 | Not started | - |
| 5. Polish + Demo Hardening | 0/4 | Not started | - |

---
*Roadmap created: 2026-03-08*
*Last updated: 2026-03-08*
