# Feature Landscape

**Domain:** AI-powered digital product template generator (demo for digi-vault.co evaluation)
**Researched:** 2026-03-08
**Context:** Demo app to convince Steve Brownlie that AI can replace manual creation of 461+ digital products

## Table Stakes

Features the demo MUST have or it fails to prove the concept. Steve will judge "can AI do my business?" based on these.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Real file downloads** | Steve's products are downloadable files. If you can't download it, it's not a product. | Low | PPTX, HTML, PNG, SVG -- actual files, not screenshots |
| **Editable outputs** | "Downloadable and editable with WordPress or Google Slides" is an explicit requirement | Medium | PPTX must open in Slides/PPT. HTML must be copy-pasteable. This is the make-or-break. |
| **Professional visual quality** | Steve sells these. If output looks amateur or "obviously AI," demo fails | Medium | Use real color palettes, proper typography specs, consistent styling. Quality > quantity. |
| **Minimal input required** | The value proposition is "AI replaces manual work." If inputs are complex, no time saved | Low | 3-5 fields max per skill. Business name, industry, purpose, style preference. |
| **Live generation progress** | Agent SDK calls take 10-30+ seconds. Blank screen = "is it broken?" | Medium | Streaming status updates: "Generating color palette..." "Writing slide 3 of 8..." |
| **Preview before download** | User needs to see what they're getting. Blind download feels untrustworthy | Medium | In-browser preview for HTML outputs, slide thumbnails for PPTX, image grid for icons |
| **Product type selection grid** | Steve needs to see breadth of capability across product categories | Low | Visual grid of 7 skills with icons, difficulty badges, clear CTAs |
| **One-click generation** | Fill form, click generate, get product. No multi-step wizards for a demo | Low | Single "Generate" button per skill |

## Differentiators

Features that would make Steve say "wow, this is better than I expected." Not required, but high-impact.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Style/brand consistency across products** | Enter brand info once, all 7 products use same colors/fonts/tone | Medium | Shared brand context object passed to all skills. Shows AI "gets" branding. |
| **Variation generation** | "Generate 3 variations" for any product -- Steve can pick best one | Low | Run same skill 3x with style tweaks. Cheap to build, impressive to demo. |
| **Before/after comparison** | Show a real digi-vault product next to AI-generated equivalent | Low | Static comparison. Requires getting 1-2 real products as reference. Very persuasive. |
| **Batch generation** | "Generate all 7 product types for one brand" in a single flow | Medium | Orchestrator chains all skills. Shows scalability: "imagine 461 products." |
| **Export format options** | PDF + HTML + PPTX for the same content | Medium | Same content, multiple export pipelines. Shows flexibility. |
| **Generation time display** | "Generated in 47 seconds" -- highlights speed vs manual creation | Low | Timer on generation. Compare: "This took 47 seconds. Manual creation: 4-8 hours." |
| **Edit-and-regenerate** | After preview, tweak one input and regenerate without starting over | Medium | Preserve form state, re-run skill. Shows iterative workflow. |
| **Token/cost display** | "This product cost $0.03 to generate" -- makes the business case | Low | Track API usage per generation. Very persuasive for the ROI conversation. |
| **Quality score** | Self-assessment: "This output scores 8.5/10 for brand consistency" | Medium | Second LLM pass to evaluate output. Risky -- if score is low, it undermines the demo. |

## Anti-Features

Things that look cool but will KILL the demo. Deliberately do NOT build these.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User accounts / auth** | It's a demo, not a SaaS. Login screens waste Steve's time and add nothing. | Direct access. Maybe a simple "Enter your brand name" landing. |
| **Drag-and-drop editor** | Massive complexity, and it shifts the demo from "AI generates" to "you still have to design." Undermines the pitch. | Show editable file downloads instead. "Open in Google Slides and customize." |
| **Real-time collaborative editing** | Google Docs-style collaboration is months of work and irrelevant to "can AI make products?" | Single-user demo. |
| **Payment / pricing tiers** | Commerce adds zero value to evaluating AI generation quality. Distracts. | No commerce. Every generation is free in the demo. |
| **AI chat interface for refinement** | "Chat with AI to refine your deck" sounds cool but turns a 30-second demo into a 10-minute conversation. Steve wants to see output quality, not chat UX. | One-shot generation with variation options. |
| **Template marketplace / browsing** | Building a store UI is not the point. The point is: can AI CREATE the products? | Direct generation, no browsing. |
| **Version history** | Impressive for a product, pointless for a demo. Adds DB complexity for zero demo value. | Generate fresh each time. |
| **Complex style customization UI** | Color pickers, font selectors, layout toggles -- turns the demo into a design tool. | Preset style options (Professional, Creative, Bold, Minimal). 4 choices max. |
| **Video/animation preview player** | Building a Lottie player with controls, timeline scrubbing, etc. is scope creep | Static SVG preview + downloadable Lottie JSON. Let After Effects handle playback. |
| **Mobile responsive demo** | Steve will see this on a laptop/desktop. Mobile polish is wasted effort for a demo. | Desktop-only, clean layout. |
| **Internationalization** | English only. Multi-language adds complexity everywhere for zero demo value. | English outputs only. |
| **AI model selection** | "Choose between GPT-4, Claude, Gemini" is a developer feature, not a business demo | Claude only (it's the client requirement anyway). Hide the implementation. |

## Feature Dependencies

```
Brand Input Form
    |
    v
Shared Brand Context -----> All 7 Skills use this
    |
    +---> Prompt Guide Generator (Easy) ---------> HTML/PDF output
    +---> Email Template Pack (Easy) --------------> HTML output
    +---> Social Media Calendar (Easy) ------------> HTML/CSV output
    +---> Proposal Deck Generator (Medium) --------> PPTX output
    +---> Brand Guidelines Kit (Medium) -----------> HTML output
    +---> Icon Pack Generator (Hard) --------------> PNG images (Replicate API)
    +---> Motion Graphics Library (Hard) ----------> SVG + Lottie JSON
                                                        |
Preview Component <-------- All outputs ------+        |
    |                                                   |
    v                                                   |
Download Pipeline <-------- All outputs ------+---------+
```

**Key dependency chain:**
1. Input form system (shared) -- must exist before any skill works
2. Skill execution pipeline (Claude Agent SDK) -- must exist before any skill works
3. Output rendering (preview) -- must exist to demo any skill
4. Download pipeline -- must exist for the demo to prove "real products"
5. Individual skills can be built independently once 1-4 exist

**Implication for roadmap:** Build the pipeline first (input -> agent -> output -> download), then plug in skills one at a time. Start with the easiest skill (Prompt Guide) to validate the full pipeline.

## Per-Skill Feature Details

### Easy Skills

#### 1. Prompt Guide Generator
**Input:** Topic, target platform (ChatGPT/Midjourney/etc), style (beginner/advanced)
**Output:** Styled HTML document with prompt examples, tips, formatting
**Table stakes:** Clean formatting, actual useful prompts, downloadable HTML/PDF
**Differentiator:** Platform-specific tips, copy-to-clipboard buttons on individual prompts
**Complexity:** Low -- pure text generation with HTML templating
**Risk:** Low -- Claude excels at this

#### 2. Email Template Pack
**Input:** Business type, email purpose (welcome/newsletter/promo), brand colors
**Output:** 3-5 responsive HTML email templates
**Table stakes:** Valid HTML email markup (table-based layout), inline CSS, mobile-responsive
**Differentiator:** Multiple templates per pack (not just one), Mailchimp/Klaviyo compatible
**Complexity:** Medium -- HTML email has quirks (no flexbox, inline styles required)
**Risk:** Medium -- email HTML is notoriously finicky. Test in multiple clients.

#### 3. Social Media Content Calendar
**Input:** Brand/business, platforms (Instagram/TikTok/LinkedIn), duration (1 week/1 month)
**Output:** Structured calendar with post ideas, captions, hashtags, posting schedule
**Table stakes:** Actual calendar grid view, platform-specific content, downloadable
**Differentiator:** Content variety (not repetitive), hashtag research, posting time recommendations
**Complexity:** Low -- structured text output, HTML table or CSV
**Risk:** Low -- Claude handles structured content well

### Medium Skills

#### 4. Proposal Deck Generator
**Input:** Company name, proposal purpose, key points (3-5), style
**Output:** 8-12 slide PPTX file
**Table stakes:** Real .pptx that opens in PowerPoint/Google Slides, professional layouts, proper slide structure (title/content/closing)
**Differentiator:** Consistent design system across slides, data visualization placeholders, speaker notes
**Complexity:** High -- pptxgenjs API has learning curve, layout math is fiddly
**Risk:** Medium -- layout quality depends heavily on content length. Long text overflows.

#### 5. Brand Guidelines Kit
**Input:** Brand name, industry, brand values/personality, existing colors (optional)
**Output:** Comprehensive brand book as styled HTML
**Table stakes:** Color palette with hex codes, typography recommendations, logo usage rules, tone of voice
**Differentiator:** Color harmony (not random colors), real font pairing suggestions, do/don't examples
**Complexity:** Medium -- structured content with visual design elements
**Risk:** Low-Medium -- output quality is high for text, visual sections need careful HTML/CSS

### Hard Skills

#### 6. Icon Pack Generator
**Input:** Style (flat/outline/3D), theme (business/nature/tech), count (6-12 icons)
**Output:** Set of consistent PNG icons
**Table stakes:** Consistent style across all icons in the pack, transparent backgrounds, reasonable resolution (512x512+)
**Differentiator:** Style consistency is THE differentiator. Coherent packs >> random individual icons.
**Complexity:** High -- requires Replicate API integration, prompt engineering for consistency
**Risk:** HIGH -- AI image generation consistency across a "pack" is genuinely hard. Individual icons are easy; making them look like a set is the challenge. May need to generate extras and curate.

#### 7. Motion Graphics Library
**Input:** Use case (YouTube intro/TikTok overlay/presentation transition), style
**Output:** SVG animations + Lottie JSON specs
**Table stakes:** Actual animated SVGs that move, downloadable Lottie files
**Differentiator:** Multiple animation styles, customizable colors, smooth easing
**Complexity:** Very High -- Claude generating valid SVG animations with proper keyframes is at the frontier of what LLMs can reliably do
**Risk:** VERY HIGH -- This is the hardest skill by far. LLMs struggle with precise animation timing, coordinate math, and Lottie format compliance. Plan for this to be the least polished skill. May need to use pre-built animation templates with AI-customized parameters rather than fully generative.

## MVP Recommendation

For the initial demo, prioritize in this order:

### Must ship (demo is pointless without these):
1. **Full pipeline** -- input form, agent execution, preview, download
2. **Prompt Guide Generator** -- proves pipeline works, lowest risk, pure text
3. **Email Template Pack** -- proves HTML output quality, visually impressive
4. **Social Media Calendar** -- proves structured output, useful and relatable

### Should ship (makes demo convincing):
4. **Proposal Deck Generator** -- proves file format output (PPTX), most "wow" factor
5. **Brand Guidelines Kit** -- proves design thinking capability, visually rich

### Nice to have (impressive but risky):
6. **Icon Pack Generator** -- proves image generation, but consistency is hard
7. **Motion Graphics Library** -- proves animation capability, but highest failure risk

### Defer to post-demo:
- Batch generation across all skills
- Complex brand context sharing
- Edit-and-regenerate workflows
- Export format flexibility (multiple formats per skill)

## Demo Flow Recommendation

The demo should follow this narrative arc:

1. **Open:** Product grid showing all 7 skills -- establishes breadth
2. **Start easy:** Generate a Prompt Guide -- fast, reliable, proves the pipeline
3. **Show breadth:** Generate an Email Template Pack -- different output type, visually impressive
4. **Escalate:** Generate a Proposal Deck -- "it makes real PowerPoints!" moment
5. **Wow:** Show Icon Pack -- AI-generated images, visual impact
6. **Close:** Show generation time + cost -- "47 seconds, $0.03" makes the business case

**Total demo time target:** 5-10 minutes for Steve to see 3-4 products generated live.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | Based on established patterns in AI generation tools (Gamma, Canva AI, Jasper) and the explicit client requirements in PROJECT.md |
| Anti-features list | HIGH | Standard demo-vs-product scoping. Well-established pattern. |
| Easy skill feasibility | HIGH | Text generation with formatting is Claude's core strength |
| Medium skill feasibility | MEDIUM | PPTX generation via pptxgenjs is proven but layout quality varies. Brand kit is straightforward. |
| Hard skill feasibility | LOW-MEDIUM | Icon consistency and motion graphics generation are genuinely at the frontier. These may need fallback strategies (templates with AI customization rather than full generation). |
| Feature dependencies | HIGH | Standard input-pipeline-output architecture |

## Sources

- Training data knowledge of: Gamma.app, Beautiful.ai, Canva AI features, Jasper AI, Copy.ai, Midjourney/DALL-E capabilities, Lottie format specifications
- PROJECT.md requirements and constraints (primary source for what Steve expects)
- Domain knowledge of digital product marketplaces (Gumroad, Creative Market, Etsy digital)
- Note: WebSearch unavailable. Feature landscape is based on training knowledge (May 2025 cutoff). Confidence in current tool capabilities may be slightly stale but the fundamental feature categories are stable.
