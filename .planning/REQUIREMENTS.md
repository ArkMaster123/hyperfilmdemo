# Requirements: DigiForge

**Defined:** 2026-03-08
**Core Value:** A business owner can pick a digital product type, provide minimal inputs, and receive a complete, professional, downloadable asset -- generated entirely by AI agents.

## v1 Requirements

Requirements for initial demo release. Each maps to roadmap phases.

### Pipeline & Infrastructure

- [ ] **PIPE-01**: User sees a product type selection grid showing all 7 skills with icons, difficulty badges, and descriptions
- [ ] **PIPE-02**: User fills a minimal input form (3-5 fields) specific to each skill type
- [ ] **PIPE-03**: User clicks one "Generate" button and the agent begins producing the asset
- [ ] **PIPE-04**: User sees real-time streaming progress updates during generation ("Generating slide 3 of 8...")
- [ ] **PIPE-05**: User sees an in-browser preview of the generated asset before downloading
- [ ] **PIPE-06**: User downloads the generated asset as a real file in the correct format (PPTX, HTML, PNG, SVG)
- [ ] **PIPE-07**: All outputs are editable — PPTX opens in Google Slides/PowerPoint, HTML is copy-pasteable, PNGs have transparent backgrounds

### Agent Architecture

- [ ] **AGENT-01**: TypeScript orchestrator routes user requests to the correct skill agent via a skill registry
- [ ] **AGENT-02**: Each skill is a self-contained config (Zod input schema, system prompt, output pipeline) — adding a new skill is adding one file
- [ ] **AGENT-03**: Skill agents use Claude API with streaming for real-time progress
- [ ] **AGENT-04**: Job store decouples agent execution from frontend via SSE (Server-Sent Events)
- [ ] **AGENT-05**: Output pipelines convert agent responses to downloadable files (HTML wrapper, pptxgenjs builder, Replicate caller, ZIP archiver)

### Easy Skill: Prompt Guide Generator

- [ ] **GUIDE-01**: User inputs topic, target platform (ChatGPT/Midjourney/etc), and style (beginner/advanced)
- [ ] **GUIDE-02**: Agent generates a styled HTML document with numbered prompts, tips, and platform-specific guidance
- [ ] **GUIDE-03**: Output is downloadable as HTML and viewable in-browser with clean formatting

### Easy Skill: Email Template Pack

- [ ] **EMAIL-01**: User inputs business type, email purpose (welcome/newsletter/promo), and brand colors
- [ ] **EMAIL-02**: Agent generates 3-5 responsive HTML email templates with inline CSS and table-based layout
- [ ] **EMAIL-03**: Output is downloadable as a ZIP of HTML files and previewable in-browser

### Easy Skill: Social Media Content Calendar

- [ ] **SOCIAL-01**: User inputs brand/business name, platforms (Instagram/TikTok/LinkedIn), and duration (1 week/1 month)
- [ ] **SOCIAL-02**: Agent generates a structured calendar with post ideas, captions, hashtags, and posting schedule
- [ ] **SOCIAL-03**: Output is downloadable as styled HTML and viewable as a calendar grid in-browser

### Medium Skill: Proposal Deck Generator

- [ ] **DECK-01**: User inputs company name, proposal purpose, 3-5 key points, and style preference
- [ ] **DECK-02**: Agent generates an 8-12 slide presentation with professional layouts using rigid slide templates
- [ ] **DECK-03**: Output is a real .pptx file that opens correctly in Google Slides and PowerPoint
- [ ] **DECK-04**: Slides have consistent design (color palette, typography, spacing) and proper structure (title, content, closing)

### Medium Skill: Brand Guidelines Kit

- [ ] **BRAND-01**: User inputs brand name, industry, brand values/personality, and optional existing colors
- [ ] **BRAND-02**: Agent generates a comprehensive brand book with color palette (hex codes), typography recommendations, logo usage rules, and tone of voice
- [ ] **BRAND-03**: Output is downloadable as styled HTML with visual design elements (color swatches, font samples, do/don't examples)

### Hard Skill: Icon Pack Generator

- [ ] **ICON-01**: User inputs style (flat/outline/3D), theme (business/nature/tech), and count (6-12 icons)
- [ ] **ICON-02**: Agent generates a set of consistent PNG icons via Replicate API with transparent backgrounds at 512x512+ resolution
- [ ] **ICON-03**: Icons within a pack have consistent style (colors, line weight, perspective)
- [ ] **ICON-04**: Output is downloadable as a ZIP of PNG files and previewable as an image grid in-browser

### Hard Skill: Motion Graphics Library

- [ ] **MOTION-01**: User inputs use case (YouTube intro/TikTok overlay/presentation transition) and style preference
- [ ] **MOTION-02**: Agent generates a set of CSS-animated SVG elements (subscribe button animation, chart pop-up, cash notes stacking, etc.)
- [ ] **MOTION-03**: Animations are smooth with proper easing and customizable colors
- [ ] **MOTION-04**: Output is downloadable as a ZIP of SVG files and previewable with animations playing in-browser

### UI/UX

- [ ] **UI-01**: Clean, modern, professional frontend built with Next.js + shadcn/ui + Tailwind CSS
- [ ] **UI-02**: Desktop-optimized layout (no mobile optimization needed for demo)
- [ ] **UI-03**: Product grid landing page with visual cards for each skill type
- [ ] **UI-04**: Dynamic input forms rendered from each skill's Zod schema
- [ ] **UI-05**: Real-time progress panel showing generation status via SSE
- [ ] **UI-06**: Preview panel displaying generated output before download
- [ ] **UI-07**: Download button serving the generated file in the correct format

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Differentiators

- **DIFF-01**: Generation time + cost display ("Generated in 47 seconds — $0.03")
- **DIFF-02**: Variation generation ("Generate 3 options" for any product)
- **DIFF-03**: Brand consistency across products (shared brand context object)
- **DIFF-04**: Edit-and-regenerate without starting over
- **DIFF-05**: Before/after comparison with real digi-vault products
- **DIFF-06**: Batch generation across all 7 skills for one brand
- **DIFF-07**: Export format options (PDF + HTML + PPTX for same content)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Demo, not SaaS — login screens waste evaluation time |
| Payment processing | No commerce — every generation is free in the demo |
| Drag-and-drop editor | Shifts narrative from "AI generates" to "you still design" — undermines pitch |
| AI chat refinement | Turns 30-second demo into 10-minute conversation — Steve wants output quality |
| Template marketplace / browsing | Building a store is not the point — the point is: can AI CREATE products? |
| Mobile responsive design | Steve demos on laptop — mobile polish is wasted effort |
| Video/animation player with controls | Static SVG preview + download — let After Effects handle playback |
| Multi-language support | English only — i18n adds complexity for zero demo value |
| AI model selection UI | Claude only per client requirement — hide the implementation |
| Complex style customization UI | Preset style options (Professional, Creative, Bold, Minimal) max |
| Version history | Product feature, not demo feature — adds DB complexity for zero value |
| Real-time collaborative editing | Months of work, irrelevant to evaluating AI generation quality |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 1 | Pending |
| PIPE-02 | Phase 1 | Pending |
| PIPE-03 | Phase 1 | Pending |
| PIPE-04 | Phase 1 | Pending |
| PIPE-05 | Phase 1 | Pending |
| PIPE-06 | Phase 1 | Pending |
| PIPE-07 | Phase 3 | Pending |
| AGENT-01 | Phase 1 | Pending |
| AGENT-02 | Phase 1 | Pending |
| AGENT-03 | Phase 1 | Pending |
| AGENT-04 | Phase 1 | Pending |
| AGENT-05 | Phase 1 | Pending |
| GUIDE-01 | Phase 2 | Pending |
| GUIDE-02 | Phase 2 | Pending |
| GUIDE-03 | Phase 2 | Pending |
| EMAIL-01 | Phase 2 | Pending |
| EMAIL-02 | Phase 2 | Pending |
| EMAIL-03 | Phase 2 | Pending |
| SOCIAL-01 | Phase 2 | Pending |
| SOCIAL-02 | Phase 2 | Pending |
| SOCIAL-03 | Phase 2 | Pending |
| DECK-01 | Phase 3 | Pending |
| DECK-02 | Phase 3 | Pending |
| DECK-03 | Phase 3 | Pending |
| DECK-04 | Phase 3 | Pending |
| BRAND-01 | Phase 3 | Pending |
| BRAND-02 | Phase 3 | Pending |
| BRAND-03 | Phase 3 | Pending |
| ICON-01 | Phase 4 | Pending |
| ICON-02 | Phase 4 | Pending |
| ICON-03 | Phase 4 | Pending |
| ICON-04 | Phase 4 | Pending |
| MOTION-01 | Phase 4 | Pending |
| MOTION-02 | Phase 4 | Pending |
| MOTION-03 | Phase 4 | Pending |
| MOTION-04 | Phase 4 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 1 | Pending |
| UI-05 | Phase 1 | Pending |
| UI-06 | Phase 1 | Pending |
| UI-07 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after roadmap creation*
