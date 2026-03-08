# PPTX SmartArt + Diagram Generation Research

Date: 2026-03-08
Scope: OSS + commercial options for generating consultant-grade PowerPoint decks with editable diagrams, plus root-cause analysis for preview-vs-desktop rendering gaps.

## What We Learned Fast

- Most OSS PPTX libraries can generate native editable shapes, text, charts, and connectors, but cannot author true PowerPoint SmartArt from scratch.
- If you need native SmartArt object support, commercial APIs (notably Aspose) are currently the practical option.
- Consultant-style quality is mostly a template and layout-system problem, not an LLM prose problem.
- The "in preview it is missing, after download it appears" issue is usually strict web-renderer compatibility (format/relationship/content-type) rather than total PPTX corruption.

## Ranked Options (Practical)

1. **PptxGenJS (JS/TS, OSS)**
   - Repo: https://github.com/gitbrent/PptxGenJS
   - Best JS/TS default for production-grade PPTX authoring.
   - Strong native primitives: slides, masters, shapes, charts, tables, images, text.
   - SmartArt: no native create API; emulate with grouped shapes/connectors.
   - Fit: best for web stack + deterministic template engine.

2. **python-pptx (Python, OSS)**
   - Repo: https://github.com/scanny/python-pptx
   - Mature Python path with robust read/write and editable native objects.
   - SmartArt support is explicitly not implemented in current docs/issues.
   - Key references:
     - https://github.com/scanny/python-pptx/issues/83
     - https://python-pptx.readthedocs.io/_/downloads/en/stable/pdf/
   - Fit: best for Python-heavy report pipelines.

3. **pptx-automizer (Node, OSS, template-first)**
   - Repo: https://github.com/singerla/pptx-automizer
   - Strong for preserving and modifying existing slide libraries.
   - SmartArt: partial/template-manipulation discussions, not a full ergonomic SmartArt authoring API.
   - Reference: https://github.com/singerla/pptx-automizer/issues/138
   - Fit: best when your design team maintains base PPTX templates.

4. **Aspose.Slides Cloud/API (Commercial)**
   - Docs: https://docs.aspose.cloud/slides/add-a-smartart-graphic-to-a-slide/
   - Notable advantage: explicit SmartArt creation/manipulation APIs.
   - Tradeoff: cost + vendor lock-in + API dependency.
   - Fit: best if native SmartArt is a hard requirement.

## Why "Consultant-Quality" Usually Looks Better in Human-Made Decks

You are probably not missing one magic library; you are missing a stricter layout system.

Common failure mode:
- LLM generates both content and layout ad hoc.
- The generator places objects dynamically without guardrails.
- Result is valid PPTX, but visual hierarchy and spacing feel amateur.

High-performing pattern:
- Freeze 8-15 slide archetypes (issue tree, 2x2, timeline, pyramid, process, org, market map).
- Put hard geometry constraints per archetype (coordinates, max chars, font sizes, line wrapping rules).
- Let AI fill semantic slots, not free-form layout.
- Enforce style tokens (font family, weights, color palette, stroke widths, icon style).

## SmartArt Reality Check

- OSS route: build SmartArt-like visuals with native shapes/connectors/groups; fully editable, but not SmartArt objects.
- Commercial route: use Aspose-style API when true SmartArt object fidelity/editability in PowerPoint UI is required.
- Strategic suggestion: treat SmartArt as optional, and build a stronger custom "diagram DSL" over native shapes. For most users, this delivers equal or better output quality with fewer compatibility surprises.

## Preview Missing Images, But Desktop PPT Shows Them

This is a known class of mismatch: desktop PowerPoint is more forgiving; web/cloud previewers are stricter.

Likely root causes:
- Broken slide relationships (`rId` mismatch, wrong target path/case, missing media part).
- Invalid or missing `[Content_Types].xml` entries.
- Unsupported media formats in previewers (often WebP/SVG/EMF/WMF edge cases).
- External linked images (`r:link`) instead of embedded package media (`r:embed`).
- Incorrect package structure that desktop auto-repairs but previewer drops.

## Hardening Checklist (Add to CI)

1. Validate every `a:blip` in `ppt/slides/*.xml` resolves to an existing relationship in matching `.rels`.
2. Resolve each relationship target path and verify it exists in the zip with exact case.
3. Fail on `TargetMode="External"` for required visuals.
4. Verify each media part has correct MIME in `[Content_Types].xml`.
5. Sniff file magic bytes and ensure extension/MIME match real format.
6. Fail or auto-convert non-web-safe image formats to PNG/JPEG for compatibility profile.
7. Run an Open XML package validator step before shipping.

## Recommended Implementation Path (for your current stack)

1. Keep `PptxGenJS` as core generator.
2. Add a template-first layer (`pptx-automizer` or internal template loader) so layout is mostly fixed.
3. Build a small diagram schema, for example:
   - `diagram.type`: `process | timeline | pyramid | matrix | org`
   - `nodes[]`: text + optional icon
   - `edges[]`: source/target + style
4. Compile schema to native shapes/connectors with deterministic geometry.
5. Add a `compatibility=web-preview` mode:
   - embed-only images
   - PNG/JPEG only
   - strip risky effects and unsupported vectors
6. Only evaluate Aspose if native SmartArt objects are truly mandatory.

## Suggested Decision Matrix

- Need editable diagrams + OSS + Node: `PptxGenJS` + rigid template system.
- Need Python pipeline: `python-pptx` + template discipline.
- Need literal SmartArt objects: Aspose.Slides API.
- Need fast AI draft decks (less deterministic object control): Gamma/SlideSpeak class APIs.

## Sources

- https://github.com/gitbrent/PptxGenJS
- https://gitbrent.github.io/PptxGenJS/
- https://github.com/scanny/python-pptx
- https://github.com/scanny/python-pptx/issues/83
- https://python-pptx.readthedocs.io/_/downloads/en/stable/pdf/
- https://github.com/singerla/pptx-automizer
- https://www.npmjs.com/package/pptx-automizer
- https://github.com/singerla/pptx-automizer/issues/138
- https://docs.aspose.cloud/slides/add-a-smartart-graphic-to-a-slide/
