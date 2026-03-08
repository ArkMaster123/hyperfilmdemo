# Domain Pitfalls

**Project:** DigiForge
**Domain:** AI-powered digital product template generator (demo app)
**Researched:** 2026-03-08
**Overall confidence:** MEDIUM (based on training data; WebSearch unavailable for verification)

---

## Critical Pitfalls

Mistakes that cause demo failure, rewrites, or make Steve's evaluation go badly.

---

### CP-1: Demo Generation Takes Too Long — Steve Loses Interest

**What goes wrong:** AI generation for a single product takes 30-90+ seconds. During a live evaluation, Steve clicks "Generate Proposal Deck," waits... waits... and concludes AI is too slow. The entire demo premise fails not because quality is bad, but because the wait kills the impression.

**Why it happens:**
- Claude API calls for complex prompts (brand guidelines, full content calendars) take 10-30s each
- Multi-step pipelines (generate content -> format -> create file) multiply latency
- Image generation via Replicate adds 15-60s per image (Icon Pack with 10 icons = minutes)
- PPTX assembly after content generation adds file I/O time
- No streaming or progress feedback — user stares at a spinner

**Consequences:** Demo feels broken. Steve's mental comparison becomes "AI = slow, agency = I just email them and get it back." Evaluation fails on UX, not capability.

**Prevention:**
- Stream ALL text generation progress to the UI in real-time (Claude SDK supports streaming)
- Show a multi-step progress indicator: "Generating content... Formatting slides... Building file..."
- For Icon Pack: generate images in parallel, show each as it completes (progressive rendering)
- Pre-generate 1-2 "hero examples" that load instantly so Steve sees quality immediately, THEN offer live generation
- Set hard timeout of 60s per product; if it's going to take longer, show partial results
- Consider caching/memoizing for the demo — same inputs should return instantly on second run

**Warning signs:**
- Any single API call taking >15s during development
- Total pipeline time >45s for easy products, >90s for hard products
- No streaming implemented by Phase 2

**Phase relevance:** Must be addressed in Phase 1 (core infrastructure). Streaming and progress UI are architectural decisions, not afterthoughts.

**Confidence:** HIGH — this is the most predictable failure mode for any AI demo.

---

### CP-2: PPTX Output Looks Amateurish — Undermines "Replace Agency" Pitch

**What goes wrong:** The generated PowerPoint deck opens in Google Slides and looks like a college student made it. Misaligned text boxes, inconsistent fonts, no visual hierarchy, generic clip-art energy. Steve compares it to his agency's work and concludes AI can't do professional design.

**Why it happens:**
- `pptxgenjs` gives you low-level primitives (x, y, width, height in inches) — there's no "make this look good" API
- AI-generated content varies in length; a title that's 3 words vs 15 words breaks fixed layouts
- Font rendering differs between PowerPoint, Google Slides, and Keynote
- No design system — each slide is positioned ad-hoc
- Color schemes are hardcoded or randomly chosen, not curated
- Images (if any) are placed with fixed dimensions that don't adapt

**Consequences:** The "Medium" difficulty product becomes the one that kills the demo. Proposal decks are something Steve's agency does well — if AI output looks worse, it proves his concern.

**Prevention:**
- Build 3-5 rigid slide TEMPLATES (title slide, content slide, two-column, full-image, closing) with pixel-perfect positioning tested in both PowerPoint and Google Slides
- Do NOT let the AI decide layout positioning — AI generates content, templates handle layout
- Use a curated set of 3-4 color palettes (dark professional, light modern, bold creative, minimal) — do not generate colors dynamically
- Test every output in Google Slides specifically (Steve's likely tool) — rendering differs from PowerPoint
- Truncate/ellipsize content that exceeds template bounds rather than letting it overflow
- Use only web-safe fonts or embed fonts: Arial, Calibri, Helvetica — never assume custom fonts will render
- Set a max character count per text zone and instruct Claude to respect it

**Warning signs:**
- Text overflowing placeholder bounds in test outputs
- Output looks different in Google Slides vs PowerPoint
- More than 2 hours spent on "just one more layout fix"
- No template system — generating slide positions dynamically

**Phase relevance:** Template system must be built in the PPTX skill phase, not deferred. This is the #1 risk for Medium-difficulty products.

**Confidence:** HIGH — pptxgenjs layout issues are extremely well-documented. Every team building programmatic PPTX hits this.

---

### CP-3: Icon Pack Generation Costs Explode or Fails Silently

**What goes wrong:** Icon Pack skill calls Replicate API to generate 10-20 icons. Each image generation costs $0.01-0.10+ depending on model. A demo session with 5 generations = 50-100 API calls = $5-10 per session. During development with iteration, costs hit $50-200 before the demo even happens. Alternatively, Replicate rate limits kick in, or the model returns low-quality/inconsistent results.

**Why it happens:**
- Image generation APIs charge per call, not per month
- "Icon pack" implies consistent style across all icons — but each generation is independent with no style memory
- Replicate model availability changes — a model that worked yesterday may be cold-started today (30s+ startup)
- No built-in retry logic for failed generations
- Inconsistent results: "minimalist line icon of a house" looks different each time, breaking pack cohesion

**Consequences:** Development budget burns before demo. Or demo day: 3 of 10 icons look great, 7 look inconsistent, and Steve sees the inconsistency as a dealbreaker.

**Prevention:**
- Set a hard budget cap with Replicate API ($20 for development, $5 for demo day)
- Use SDXL or a consistent model — avoid switching models mid-development
- For style consistency: generate a "style reference" prompt prefix and use it for ALL icons in a pack (e.g., "minimalist line art, 2px stroke, single color, 64x64, white background, [subject]")
- Cache ALL generated images during development — never regenerate what you've already generated
- Have 2-3 pre-generated icon packs as fallbacks if API fails during demo
- Implement retry with exponential backoff (Replicate cold starts are common)
- Limit pack size to 6 icons for the demo — more than enough to prove the concept, far cheaper

**Warning signs:**
- Replicate bill >$10 during first week of development
- Icons in same pack look like they came from different artists
- Any generation taking >60s (cold start issue)
- No fallback plan if API is down during demo

**Phase relevance:** Hard skill phase. Must implement cost controls and caching from day 1 of this skill's development.

**Confidence:** MEDIUM — based on general image generation API experience. Replicate-specific pricing and behavior may have changed.

---

### CP-4: SVG/Lottie Motion Graphics Are Impossibly Complex

**What goes wrong:** The "Hard: Motion Graphics Library" skill is scoped as AI-generated SVG animations + Lottie specs. In practice, asking Claude to generate complex SVG animations produces broken, non-rendering, or trivially simple output. The gap between "YouTube intro motion graphic" and "a circle that pulses" is enormous.

**Why it happens:**
- SVG animation (SMIL or CSS) is extremely verbose and error-prone — a single wrong attribute breaks the entire animation
- Lottie JSON format is massive and intricate — it was designed for After Effects export, not hand/AI authoring
- Claude can generate simple SVG animations (fade, slide, pulse) but struggles with complex compositions (multi-element choreographed motion)
- Browser compatibility for SVG animations varies (especially SMIL vs CSS animations)
- There's no good way to "preview" generated animations without rendering them in a browser

**Consequences:** This skill either produces embarrassingly simple output ("here's a spinning logo") or broken output that doesn't render. Either way, it fails the "Hard" designation — it's supposed to impress Steve.

**Prevention:**
- DRAMATICALLY reduce scope: don't promise "motion graphics library." Promise "animated SVG elements" — loading spinners, icon animations, simple transitions
- Use CSS animations exclusively — skip SMIL (deprecated in Chrome, inconsistent support)
- Build a library of 5-10 animation TEMPLATES (fade-in, slide-up, bounce, pulse, rotate, scale) and have Claude fill in the parameters (colors, timing, elements) rather than generating animation logic from scratch
- Skip Lottie generation entirely for the demo — it's a rabbit hole. SVG + CSS is sufficient to demonstrate capability
- Test every generated animation in Chrome, Safari, and Firefox during development
- Have pre-built "hero" animations that always work, with live generation as a secondary feature

**Warning signs:**
- Spending >1 day trying to get Claude to generate valid Lottie JSON
- Generated SVGs that render in Chrome but not Safari
- Animation output that is indistinguishable from what a CSS animation tutorial produces
- Scope discussions about "how complex should the motion graphics be?"

**Phase relevance:** This is the HIGHEST RISK skill. Should be tackled last, with a clear fallback plan (simplified scope or pre-built templates). If the demo timeline is tight, this skill should be the first to cut or simplify.

**Confidence:** HIGH — LLMs generating complex structured animation formats is a well-known difficulty. The gap between "possible" and "impressive" is very large here.

---

### CP-5: Claude Agent SDK Over-Engineering — Agent Hierarchy Becomes the Product

**What goes wrong:** Team builds a sophisticated multi-agent hierarchy: orchestrator agent -> router agent -> skill agents -> sub-agents for formatting -> sub-agents for quality checking. Each agent has its own system prompt, tools, and state. The architecture becomes so complex that debugging a single generation requires tracing through 5+ agent calls. Adding a new skill requires understanding the entire hierarchy.

**Why it happens:**
- Agent SDK encourages thinking in agent hierarchies
- It feels architecturally "right" to decompose into many agents
- Each additional agent seems like it adds value (quality checker! formatter! reviewer!)
- Developer focuses on the elegance of the orchestration rather than the output quality

**Consequences:**
- Development time doubles because most time is spent on agent plumbing, not output quality
- Debugging is nightmarish — which agent in the chain produced the bad output?
- Latency multiplies — each agent call is another Claude API round-trip (3-10s each)
- Token costs explode — system prompts for 5 agents = 5x the prompt tokens per generation

**Prevention:**
- FLAT architecture: ONE orchestrator that routes to skill agents. That's it. Two levels max.
- Each skill agent is ONE Claude call with a well-crafted prompt — no sub-agents
- No "quality checker" agent — build quality into the skill prompt itself
- No "formatter" agent — formatting is code logic (templates, not AI)
- Rule of thumb: if the agent hierarchy diagram needs more than 2 levels, you've over-engineered it
- Measure: total Claude API calls per generation should be 1-3, not 5-10

**Warning signs:**
- More than 2 levels in the agent hierarchy
- Any generation requiring >3 Claude API calls
- Time spent on "agent communication" exceeds time spent on prompt quality
- System prompts that describe how agents interact rather than what they produce

**Phase relevance:** Phase 1 (core infrastructure). The agent architecture decision sets the ceiling for everything else. Get this wrong and every skill is slower and more expensive.

**Confidence:** HIGH — over-engineering agent hierarchies is the #1 mistake in the current agent-building wave.

---

### CP-6: Tool Sprawl in Agent SDK

**What goes wrong:** Each skill agent gets loaded with 10+ tools — file writer, format converter, template selector, style applier, content validator, image generator, etc. Tool descriptions consume tokens, tool selection becomes unreliable, and the agent spends turns "thinking about which tool to use" instead of producing output.

**Why it happens:**
- Tools feel like capabilities — more tools = more capable agent
- Each edge case gets its own tool rather than being handled in prompt logic
- No discipline about tool necessity — tools are added "just in case"

**Consequences:**
- Token costs increase (tool schemas are large)
- Agent makes wrong tool selections, producing errors or unexpected behavior
- Generation latency increases as the model processes tool options
- Debugging requires understanding tool interaction, not just prompt logic

**Prevention:**
- Max 3-4 tools per skill agent. If you need more, your skill is doing too much.
- Tools should be for SIDE EFFECTS only (write file, call API, fetch data). Content generation is the prompt's job.
- Keep tool schemas minimal — short descriptions, few parameters
- Test: can you remove this tool and handle it in the prompt or calling code? If yes, remove it.

**Warning signs:**
- Any agent with >5 tools
- Tools that "generate content" (that's the prompt's job)
- Tool descriptions longer than 2 sentences
- Agent output includes tool-selection reasoning visible to the user

**Phase relevance:** Phase 1 (core infrastructure). Tool design is part of architecture.

**Confidence:** HIGH — well-documented pattern in agent SDK usage.

---

## Moderate Pitfalls

Mistakes that cause delays, rework, or degraded demo quality.

---

### MP-1: Next.js Streaming + AI Patterns — Timeouts and Memory

**What goes wrong:** Long-running AI generation (30-90s for complex products) hits Next.js/Vercel default timeouts. Streaming responses accumulate in server memory. The connection drops mid-generation and there's no recovery mechanism.

**Prevention:**
- Use Server-Sent Events (SSE) or WebSocket for generation progress — NOT traditional HTTP request/response
- Set explicit timeout values well above expected generation time (120s minimum)
- If deploying to Vercel: serverless function timeout is 10s on free tier, 60s on Pro — may need to self-host or use Edge functions
- Implement generation state persistence: if connection drops, user can reconnect and see progress
- Do NOT accumulate the entire generation result in memory — stream chunks to the client and to disk

**Warning signs:**
- "504 Gateway Timeout" errors during development
- Memory usage climbing during generation
- No error handling for dropped connections
- Deploying to Vercel free tier without checking timeout limits

**Phase relevance:** Phase 1 infrastructure. Streaming architecture must be decided before skills are built.

**Confidence:** HIGH — Next.js timeout issues with AI are extremely common.

---

### MP-2: HTML/CSS Output Looks Different Everywhere

**What goes wrong:** HTML-based products (Prompt Guide, Email Templates, Brand Guidelines) look great in the preview but break when opened in Gmail, Outlook, or downloaded and opened in a browser with different viewport/fonts.

**Prevention:**
- Email templates: use MJML or table-based layout — modern CSS does NOT work in email clients
- Prompt Guide/Brand Guidelines: inline ALL CSS, use web-safe fonts, test at multiple viewport widths
- Provide both HTML preview AND PDF download (html-to-pdf conversion ensures consistent rendering)
- Do NOT use flexbox/grid in email templates — table layout only
- Test email output in Litmus or at minimum in Gmail web, Gmail mobile, and Outlook

**Warning signs:**
- Email templates using `<div>` layout instead of `<table>`
- CSS loaded from external stylesheets (won't work in email or offline)
- Output that looks perfect in Chrome but breaks in Safari

**Phase relevance:** Easy skills phase. Must be addressed when building the first HTML-output skill.

**Confidence:** HIGH — email HTML compatibility is one of the most well-known web development pitfalls.

---

### MP-3: AI Output Quality Variance — Same Prompt, Different Quality

**What goes wrong:** Running the same generation 3 times produces 1 great result, 1 acceptable result, and 1 poor result. During the demo, Steve happens to get the poor one and judges the whole system by it.

**Prevention:**
- Use temperature=0 or very low temperature (0.1-0.2) for all content generation — sacrifice creativity for consistency
- Use highly structured prompts with exact output format specifications (JSON mode where possible)
- Validate output programmatically before presenting: check word counts, required sections, format compliance
- Implement a "quality gate" in code (not another AI agent) — reject outputs that don't meet structural criteria and retry once
- Pre-test every skill 10+ times before the demo; identify and fix prompts that produce inconsistent results
- Seed the random generation if the API supports it

**Warning signs:**
- Running a skill 5 times and getting visually different quality levels
- Claude sometimes returning markdown when you expect HTML, or vice versa
- Content length varying 3x between runs
- No output validation between generation and presentation

**Phase relevance:** All phases. Every skill needs output validation, but the testing/hardening should be a dedicated phase before demo.

**Confidence:** HIGH — LLM output variance is fundamental and well-understood.

---

### MP-4: Demo Scope Creep — "Just One More Product Type"

**What goes wrong:** During development, ideas keep coming: "What about resume templates? What about logo generators? What about..." The 7 skills become 12, none are polished, and the demo feels like a proof-of-concept rather than a finished product.

**Prevention:**
- HARD CAP at 7 skills. Written in the project charter. No additions without removing something.
- Quality over quantity: 5 polished skills > 7 half-baked skills > 12 broken skills
- If a skill isn't working well by its deadline, cut it and polish the others
- Define "done" for each skill before starting: specific acceptance criteria, not "it generates something"
- Steve doesn't need to see 7 skills to evaluate AI — he needs to see 3-4 working impressively

**Warning signs:**
- Discussion about adding skill #8 before skill #4 is complete
- Any skill without written acceptance criteria
- "We can add this in a day" optimism about new features
- More than 50% of development time spent on hard skills

**Phase relevance:** All phases. Scope must be defended throughout the project.

**Confidence:** HIGH — scope creep in demos is universal.

---

### MP-5: Font and Asset Licensing in Generated Content

**What goes wrong:** Generated PPTX uses a font that's not available on Steve's machine. Generated brand guidelines reference font families that require licenses. Icons generated by AI may inadvertently replicate copyrighted styles.

**Prevention:**
- Use ONLY Google Fonts or system fonts (Arial, Helvetica, Times New Roman, Calibri)
- In PPTX: stick to fonts bundled with PowerPoint/Google Slides
- In brand guidelines: only recommend fonts that are free to use (Google Fonts catalog)
- For icon generation: include "original design" in prompts, avoid referencing specific icon libraries by name
- Document font choices in the skill configuration — make it explicit, not implicit

**Warning signs:**
- Custom font names appearing in generated output
- PPTX files showing "font substitution" warnings in Google Slides
- Brand guidelines recommending paid fonts

**Phase relevance:** Medium skills phase (PPTX, Brand Guidelines).

**Confidence:** HIGH — font compatibility is a known issue in document generation.

---

### MP-6: No Graceful Degradation — One Failure Kills the Demo

**What goes wrong:** During Steve's evaluation, Replicate API is slow, or Claude returns an error, or the PPTX library throws an exception. The UI shows a generic error message (or worse, a blank screen). Steve's impression: "this thing is broken."

**Prevention:**
- Every skill must have an error boundary that shows a helpful message, not a crash
- Implement timeouts with user-visible countdown: "Generating... this usually takes 30 seconds"
- For API-dependent skills (Icon Pack), have a cached/pre-generated fallback
- Add a "Try Again" button — transient failures are common with AI APIs
- Log errors server-side so you can diagnose, but show friendly messages client-side
- Test the failure modes: disconnect from internet, send malformed input, trigger rate limits

**Warning signs:**
- No error handling in API call chains
- Unhandled promise rejections in the console
- No loading states or progress indicators
- "It works on my machine" without testing edge cases

**Phase relevance:** Should be built into Phase 1 infrastructure (error boundary pattern), then applied to each skill.

**Confidence:** HIGH — demo resilience is a universal concern.

---

## Minor Pitfalls

Mistakes that cause annoyance or polish issues but are fixable.

---

### mP-1: File Download UX Is Clunky

**What goes wrong:** Generated files download with names like `output-1709913245.pptx` or the download triggers a browser warning. User doesn't know where the file went.

**Prevention:**
- Name files descriptively: `DigiForge-Proposal-Deck-TechStartup.pptx`
- Use proper MIME types for downloads
- Show a "Download complete" confirmation with the filename
- Provide preview before download so user knows what they're getting

**Confidence:** HIGH

---

### mP-2: Social Media Content Calendar Is Just a Table

**What goes wrong:** The "Social Media Content Calendar" skill outputs a plain table of dates and post ideas. It doesn't feel like a "product" — it feels like ChatGPT output pasted into a spreadsheet.

**Prevention:**
- Output as a styled HTML page with calendar grid view, not just a list
- Include platform-specific formatting tips, hashtag suggestions, best posting times
- Add color coding by content type (promotional, educational, engagement)
- Provide downloadable CSV for import into scheduling tools AND a styled HTML preview
- Include example post copy, not just topic ideas

**Warning signs:**
- Output is indistinguishable from a ChatGPT response
- No visual design in the output
- Steve can replicate the output by typing into ChatGPT himself

**Confidence:** HIGH — the "why not just use ChatGPT" comparison is the existential threat to every AI demo.

---

### mP-3: Brand Guidelines Kit Recommends Unusable Colors

**What goes wrong:** AI generates a color palette that's aesthetically questionable or has accessibility issues (low contrast text on background). The brand guidelines look AI-generated in the worst way.

**Prevention:**
- Curate 10-15 color palette presets (pulled from successful brands) rather than generating colors dynamically
- Validate all color combinations for WCAG contrast compliance
- Use HSL-based generation with constrained ranges if generating dynamically (saturation 40-70%, lightness 30-60% for primary)
- Show the colors applied to sample layouts, not just swatches

**Confidence:** MEDIUM — AI color generation quality may have improved.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|-------------|---------------|------------|----------|
| Core Infrastructure (Agent SDK) | Over-engineered agent hierarchy (CP-5) | Flat 2-level max architecture | Critical |
| Core Infrastructure (Streaming) | Timeout/memory issues (MP-1) | SSE + proper timeout config | Critical |
| Easy Skills (HTML output) | Email HTML compatibility (MP-2) | Table-based email, inline CSS | Moderate |
| Easy Skills (Content Calendar) | "Just ChatGPT" output (mP-2) | Styled visual output, not plain text | Moderate |
| Medium Skills (PPTX) | Amateurish layouts (CP-2) | Rigid template system, tested in Google Slides | Critical |
| Medium Skills (Brand Kit) | Bad color generation (mP-3) | Curated palettes, contrast validation | Minor |
| Hard Skills (Icon Pack) | Cost explosion + inconsistency (CP-3) | Budget caps, style prompts, caching, fallbacks | Critical |
| Hard Skills (Motion Graphics) | Impossibly complex scope (CP-4) | Reduce to "animated SVG elements," template-based | Critical |
| Pre-Demo Hardening | Quality variance (MP-3) | Low temperature, output validation, 10x testing | Moderate |
| Pre-Demo Hardening | No graceful degradation (MP-6) | Error boundaries, fallbacks, retry buttons | Moderate |
| All Phases | Scope creep (MP-4) | Hard cap at 7 skills, cut before adding | Moderate |

## Demo-Day Specific Risks

These are not development pitfalls but operational risks for the actual evaluation session.

| Risk | Impact | Mitigation |
|------|--------|------------|
| Replicate API is down/slow | Icon Pack skill fails live | Pre-generated fallback pack, try Replicate before demo |
| Claude API rate limited | All skills fail | Have pre-generated examples for every skill as backup |
| WiFi is unreliable at demo location | Everything fails | Pre-cache assets, have screen recording of successful runs |
| Steve tries unexpected inputs | Output is incoherent | Input validation, constrained input forms (dropdowns, not free text where possible) |
| Generation takes >60s | Steve loses patience | Progress indicators, partial results, pre-generated hero examples |

## The Meta-Pitfall: Optimizing for Capability Instead of Impression

The most dangerous pitfall for this entire project is optimizing for technical capability (can the AI do X?) instead of impression quality (does the output make Steve think "this could replace my agency?").

**What this means practically:**
- A simple product that looks BEAUTIFUL beats a complex product that looks mediocre
- 4 polished skills > 7 rough skills
- Pre-generated hero examples that showcase the best possible output are MORE valuable than live generation that shows average output
- The demo should lead with the most impressive skill and end with the most impressive skill
- Hard skills (Icon Pack, Motion Graphics) should only be shown if they genuinely impress — otherwise, cut them and show more polished easy/medium skills

**The demo narrative should be:** "Look at this quality" not "Look at all these things it can do."

---

## Sources and Confidence Notes

All findings in this document are based on training data (knowledge cutoff ~early 2025). Key confidence caveats:

- **Claude Agent SDK patterns:** MEDIUM confidence. SDK may have evolved with new best practices, new features, or changed APIs since training cutoff.
- **pptxgenjs specifics:** MEDIUM confidence. Library API and capabilities should be verified via Context7 or npm docs before implementation.
- **Replicate API pricing/behavior:** LOW-MEDIUM confidence. Pricing, available models, and cold start behavior may have changed significantly. Verify current pricing before budgeting.
- **Lottie/SVG generation difficulty:** HIGH confidence. This is a fundamental complexity issue unlikely to have changed.
- **Next.js streaming patterns:** MEDIUM confidence. Next.js App Router patterns evolve quickly. Verify current best practices for streaming AI responses.
- **Demo strategy advice:** HIGH confidence. Demo psychology and scope management are domain-independent and stable over time.
