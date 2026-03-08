# Architecture Patterns

**Domain:** AI-powered multi-agent digital product generator
**Project:** DigiForge
**Researched:** 2026-03-08

## Confidence Note

WebSearch and WebFetch were unavailable during this research. Architecture recommendations are based on training knowledge of the Anthropic TypeScript SDK (`@anthropic-ai/sdk`), Next.js App Router patterns, and established multi-agent system design. Confidence levels are noted per section. The Claude Agent SDK specifics (if it differs from the standard Anthropic SDK with tool-use patterns) should be verified against official docs before implementation begins.

---

## Recommended Architecture

### High-Level System Diagram

```
+------------------------------------------------------+
|                    FRONTEND (Next.js)                 |
|  +----------+  +-------------+  +-----------------+  |
|  | Product   |  | Input Form  |  | Progress +      |  |
|  | Grid      |  | (per skill) |  | Download Panel  |  |
|  +----------+  +------+------+  +--------+--------+  |
|                        |                  ^            |
+------------------------|------------------|------------+
                         | POST /api/generate
                         | (skill + inputs)
                         v                  |
+------------------------|------------------|------------+
|                    API LAYER              |            |
|  +----------------+    |    +-------------+--------+  |
|  | POST           |    |    | GET                   |  |
|  | /api/generate   +----+   | /api/generate/[jobId] |  |
|  | (start job)    |         | (SSE stream)          |  |
|  +-------+--------+        +----------+------------+  |
|          |                             ^               |
+----------|-----------------------------+---------------+
           v                             |
+----------|-----------------------------|--------------+
|          |        AGENT LAYER          |              |
|  +-------v--------+                   |              |
|  |  ORCHESTRATOR   |   progress events|              |
|  |  (routing +     +----->------------+              |
|  |   coordination) |                                 |
|  +--+-----------+--+                                 |
|     |           |                                    |
|     v           v                                    |
|  +--+---+  +---+----+  +--------+  (7 skill agents) |
|  |Skill |  |Skill   |  |Skill   |                   |
|  |Agent |  |Agent   |  |Agent   |                   |
|  |  A   |  |  B     |  |  C ... |                   |
|  +--+---+  +---+----+  +---+----+                   |
|     |           |           |                        |
+-----|-----------|-----------|------------------------+
      v           v           v
+-----|-----------|-----------|------------------------+
|     |    OUTPUT PIPELINE     |                        |
|  +--v---+  +---v----+  +---v----+                    |
|  | HTML  |  | PPTX   |  | PNG    |                   |
|  | Gen   |  | Gen    |  | Gen    |                   |
|  +--+---+  +---+----+  +---+----+                    |
|     |           |           |                        |
|     v           v           v                        |
|  +--------------------------------------+            |
|  |         File Storage (tmp/)          |            |
|  +--------------------------------------+            |
+------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Technology |
|-----------|---------------|-------------------|------------|
| **Product Grid UI** | Display available skills, handle selection | Input Form | React + shadcn/ui |
| **Input Form** | Render skill-specific form, validate inputs, submit | API Layer | React Hook Form + Zod |
| **Progress Panel** | Show real-time generation status, offer download | API Layer (SSE) | React + EventSource |
| **API Route: POST /api/generate** | Validate request, create job, invoke orchestrator | Orchestrator Agent | Next.js Route Handler |
| **API Route: GET /api/generate/[jobId]** | Stream progress events via SSE | Job Store | Next.js Route Handler |
| **Orchestrator Agent** | Route to correct skill, coordinate execution, report progress | Skill Agents, Job Store | Anthropic SDK |
| **Skill Agent (x7)** | Execute product generation for one product type | Output Pipeline | Anthropic SDK |
| **Output Pipeline** | Convert agent output to downloadable file format | File Storage | pptxgenjs, Replicate, etc. |
| **Job Store** | Track job status, buffer progress events | API Layer, Orchestrator | In-memory Map (demo) |
| **File Storage** | Hold generated files for download | Download API | Local tmp/ directory |

---

## Data Flow

### Request Flow (Happy Path)

```
1. User selects "Prompt Guide Generator" from Product Grid
2. Input Form renders fields: topic, platform, style
3. User fills form, clicks Generate
4. Frontend POSTs to /api/generate:
   { skill: "prompt-guide", inputs: { topic: "...", platform: "..." } }
5. API route validates inputs against skill's Zod schema
6. API route creates jobId, stores in Job Store (status: "started")
7. API route kicks off orchestrator async (does NOT await completion)
8. API route returns { jobId } immediately
9. Frontend opens EventSource to /api/generate/{jobId}
10. Orchestrator resolves skill from registry, invokes skill agent
11. Skill agent streams progress events to Job Store:
    { type: "progress", step: "Generating outline...", percent: 20 }
    { type: "progress", step: "Writing content...", percent: 50 }
12. SSE endpoint reads from Job Store, forwards events to frontend
13. Skill agent returns structured output (HTML content)
14. Output pipeline converts to final format (styled HTML file)
15. File saved to tmp/{jobId}/prompt-guide.html
16. Job Store updated: { status: "complete", downloadUrl: "/api/download/{jobId}" }
17. SSE sends final event: { type: "complete", downloadUrl: "..." }
18. Frontend shows download button
```

### Data Flow Direction

```
User Input --> API Validation --> Orchestrator --> Skill Agent --> Claude API
                                                                      |
User Download <-- File Storage <-- Output Pipeline <-- Agent Output <--+
                                                                      |
User Progress <-- SSE Stream <-- Job Store <-- Progress Events <------+
```

Key principle: **Data flows in one direction.** The frontend never talks directly to agents. The API layer is the only bridge.

---

## Core Architecture Patterns

### Pattern 1: Skill Registry (Confidence: HIGH)

Each skill is a self-contained configuration object. Adding a new skill means adding a new config file -- no changes to orchestrator or routing logic.

**What:** A registry that maps skill IDs to their configuration (input schema, system prompt, output format, agent config).

**Why:** The project requirement says "templateized so new product types can be added as simple config." A registry pattern makes this literally true.

```typescript
// src/skills/registry.ts
import { z } from "zod";

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  inputSchema: z.ZodSchema;
  systemPrompt: string;
  outputFormat: "html" | "pptx" | "png" | "svg" | "json";
  outputPipeline: (agentOutput: string) => Promise<Buffer>;
  estimatedTime: string; // "~30 seconds"
}

// Registry is a simple Map
const skills = new Map<string, SkillConfig>();

export function registerSkill(config: SkillConfig) {
  skills.set(config.id, config);
}

export function getSkill(id: string): SkillConfig | undefined {
  return skills.get(id);
}

export function getAllSkills(): SkillConfig[] {
  return Array.from(skills.values());
}
```

```typescript
// src/skills/prompt-guide.ts
import { z } from "zod";
import { registerSkill } from "./registry";

const inputSchema = z.object({
  topic: z.string().min(3).describe("What the prompt guide is about"),
  platform: z.enum(["chatgpt", "claude", "midjourney", "stable-diffusion"]),
  promptCount: z.number().min(5).max(50).default(10),
});

registerSkill({
  id: "prompt-guide",
  name: "Prompt Guide Generator",
  description: "Generate a styled prompt guide for any AI platform",
  difficulty: "easy",
  icon: "book-text",
  inputSchema,
  systemPrompt: `You are an expert prompt engineer. Generate a comprehensive,
    beautifully structured prompt guide. Output valid HTML with inline CSS...`,
  outputFormat: "html",
  outputPipeline: async (html: string) => Buffer.from(html, "utf-8"),
  estimatedTime: "~30 seconds",
});
```

### Pattern 2: Orchestrator as Router, Not Controller (Confidence: HIGH)

**What:** The orchestrator agent's ONLY job is to validate the request and dispatch to the correct skill agent. It does NOT generate content itself.

**Why:** Keeping the orchestrator thin makes it fast, predictable, and testable. Content generation belongs in skill agents.

```typescript
// src/agents/orchestrator.ts
import Anthropic from "@anthropic-ai/sdk";
import { getSkill } from "../skills/registry";
import { executeSkillAgent } from "./skill-executor";
import { JobStore } from "../lib/job-store";

export async function orchestrate(
  skillId: string,
  inputs: Record<string, unknown>,
  jobId: string,
  jobStore: JobStore
) {
  // 1. Resolve skill
  const skill = getSkill(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);

  // 2. Validate inputs
  const parsed = skill.inputSchema.parse(inputs);

  // 3. Report start
  jobStore.addEvent(jobId, {
    type: "progress",
    step: `Starting ${skill.name}...`,
    percent: 0,
  });

  // 4. Execute skill agent
  const result = await executeSkillAgent(skill, parsed, jobId, jobStore);

  // 5. Run output pipeline
  jobStore.addEvent(jobId, {
    type: "progress",
    step: "Formatting output...",
    percent: 90,
  });

  const fileBuffer = await skill.outputPipeline(result);

  // 6. Save file
  const filePath = await saveFile(jobId, skill, fileBuffer);

  // 7. Mark complete
  jobStore.addEvent(jobId, {
    type: "complete",
    downloadUrl: `/api/download/${jobId}`,
  });

  return filePath;
}
```

**Important distinction:** The orchestrator here is a plain TypeScript function, NOT a Claude agent itself. Using Claude to "decide which skill to invoke" would be wasteful when the frontend already sends `{ skill: "prompt-guide" }`. Claude agent calls are expensive and slow -- use them only where AI reasoning is needed (content generation), not for routing.

### Pattern 3: Skill Agent Execution with Streaming (Confidence: MEDIUM)

**What:** Each skill agent is a single Claude API call with tool-use, streaming the response for progress updates.

**Why:** The Anthropic SDK supports streaming via `client.messages.stream()`. We can tap into the stream for progress reporting while collecting the full response for the output pipeline.

```typescript
// src/agents/skill-executor.ts
import Anthropic from "@anthropic-ai/sdk";
import { SkillConfig } from "../skills/registry";
import { JobStore } from "../lib/job-store";

const client = new Anthropic();

export async function executeSkillAgent(
  skill: SkillConfig,
  inputs: Record<string, unknown>,
  jobId: string,
  jobStore: JobStore
): Promise<string> {
  const userMessage = buildUserMessage(skill, inputs);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: skill.systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  let fullContent = "";
  let lastProgressAt = 0;

  stream.on("text", (text) => {
    fullContent += text;
    // Emit progress based on content length vs expected
    const percent = Math.min(85, Math.floor((fullContent.length / 5000) * 85));
    if (percent > lastProgressAt + 10) {
      lastProgressAt = percent;
      jobStore.addEvent(jobId, {
        type: "progress",
        step: "Generating content...",
        percent,
      });
    }
  });

  const finalMessage = await stream.finalMessage();
  return fullContent;
}
```

**Confidence note (MEDIUM):** The exact streaming API (`client.messages.stream()` with `.on("text")`) reflects the Anthropic TypeScript SDK as of my training. Verify the current streaming API surface before implementation.

### Pattern 4: Job Store for Async Communication (Confidence: HIGH)

**What:** An in-memory store that buffers job status and progress events, decoupling the agent execution from the SSE stream.

**Why:** The API route that starts generation returns immediately with a jobId. A separate SSE endpoint reads events from the store. This decoupling means the agent can run on its own timeline while the frontend connects/reconnects freely.

```typescript
// src/lib/job-store.ts
export interface JobEvent {
  type: "progress" | "complete" | "error";
  step?: string;
  percent?: number;
  downloadUrl?: string;
  error?: string;
  timestamp: number;
}

export class JobStore {
  private jobs = new Map<string, {
    status: "running" | "complete" | "error";
    events: JobEvent[];
    listeners: Set<(event: JobEvent) => void>;
  }>();

  createJob(jobId: string) {
    this.jobs.set(jobId, {
      status: "running",
      events: [],
      listeners: new Set(),
    });
  }

  addEvent(jobId: string, event: Omit<JobEvent, "timestamp">) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    const fullEvent = { ...event, timestamp: Date.now() };
    job.events.push(fullEvent);
    if (event.type === "complete") job.status = "complete";
    if (event.type === "error") job.status = "error";
    // Notify all SSE listeners
    job.listeners.forEach((fn) => fn(fullEvent));
  }

  subscribe(jobId: string, listener: (event: JobEvent) => void): () => void {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Unknown job: ${jobId}`);
    // Send all past events (for reconnection)
    job.events.forEach(listener);
    // Subscribe to future events
    job.listeners.add(listener);
    return () => job.listeners.delete(listener);
  }
}

// Singleton for the process
export const jobStore = new JobStore();
```

### Pattern 5: SSE Streaming from Next.js Route Handler (Confidence: HIGH)

**What:** A Next.js App Router route handler that returns a `ReadableStream` with SSE formatting.

**Why:** SSE (Server-Sent Events) is the simplest protocol for server-to-client streaming. No WebSocket complexity needed. Next.js Route Handlers support returning `Response` with a `ReadableStream`.

```typescript
// src/app/api/generate/[jobId]/route.ts
import { jobStore } from "@/lib/job-store";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const unsubscribe = jobStore.subscribe(jobId, (event) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));

        if (event.type === "complete" || event.type === "error") {
          controller.close();
        }
      });

      // Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using Claude as the Orchestrator/Router

**What:** Making a Claude API call to "decide" which skill to invoke based on user input.

**Why bad:** The frontend already knows which skill the user selected. Burning an API call (500ms-2s + cost) to make Claude parse `"prompt-guide"` and route to the prompt guide agent is pure waste. Claude is for generation, not routing.

**Instead:** The orchestrator is a plain TypeScript function that does a `Map.get(skillId)`. Save Claude calls for the skill agents where AI reasoning actually adds value.

### Anti-Pattern 2: Awaiting Agent Completion in the API Route

**What:** Having the POST /api/generate route await the full agent execution before responding.

**Why bad:** Agent calls take 10-60 seconds. HTTP timeouts, no progress feedback, terrible UX.

**Instead:** POST creates a job, kicks off agent async (fire-and-forget with error handling), returns jobId immediately. Frontend polls/streams via SSE.

### Anti-Pattern 3: One Giant Agent with All Skills

**What:** A single system prompt that says "You can generate prompt guides, email templates, proposal decks..." with all instructions in one prompt.

**Why bad:** Prompt bloat degrades quality. Each skill needs focused, specific instructions. A 10,000-token system prompt covering 7 skills will underperform 7 focused 1,500-token prompts.

**Instead:** Each skill has its own system prompt, optimized for that specific output. The orchestrator dispatches to the right one.

### Anti-Pattern 4: Storing Generated Files in Memory

**What:** Keeping generated file buffers in the Node.js process memory.

**Why bad:** A single PPTX or set of PNGs can be several MB. With concurrent users, memory balloons fast.

**Instead:** Write to disk (`/tmp/digiforge/{jobId}/`) immediately after generation. Serve via a download route that streams from disk. Clean up with a TTL (e.g., delete after 1 hour).

### Anti-Pattern 5: Complex Agent-to-Agent Communication

**What:** Having agents call other agents, pass messages, negotiate.

**Why bad:** Unnecessary complexity for this use case. Each skill is independent -- a prompt guide doesn't need to coordinate with an icon pack generator.

**Instead:** Flat dispatch: orchestrator calls exactly one skill agent per request. No inter-agent communication needed.

---

## Detailed Component Architecture

### Directory Structure

```
src/
  app/
    page.tsx                      # Product grid (landing page)
    generate/[skillId]/page.tsx   # Input form for selected skill
    api/
      generate/
        route.ts                  # POST: start generation job
        [jobId]/
          route.ts                # GET: SSE stream for job progress
      download/
        [jobId]/
          route.ts                # GET: download generated file
      skills/
        route.ts                  # GET: list all available skills

  components/
    product-grid.tsx              # Grid of skill cards
    skill-form.tsx                # Dynamic form from Zod schema
    generation-progress.tsx       # SSE-connected progress display
    download-button.tsx           # Download completed file

  skills/
    registry.ts                   # Skill registration + lookup
    types.ts                      # SkillConfig type definition
    prompt-guide.ts               # Easy: Prompt Guide skill
    email-template.ts             # Easy: Email Templates skill
    content-calendar.ts           # Easy: Social Media Calendar skill
    proposal-deck.ts              # Medium: Proposal Deck skill
    brand-guidelines.ts           # Medium: Brand Guidelines skill
    icon-pack.ts                  # Hard: Icon Pack skill
    motion-graphics.ts            # Hard: Motion Graphics skill

  agents/
    orchestrator.ts               # Thin router, not a Claude agent
    skill-executor.ts             # Executes skill agent via Claude API

  pipelines/
    html.ts                       # HTML output formatting
    pptx.ts                       # PPTX generation (pptxgenjs)
    png.ts                        # Image generation (Replicate)
    svg.ts                        # SVG/Lottie output

  lib/
    job-store.ts                  # In-memory job tracking
    anthropic.ts                  # Anthropic client singleton
    file-store.ts                 # File write/read/cleanup
    schemas.ts                    # Shared Zod schemas
```

### Input Schema Validation Per Skill

Each skill defines a Zod schema. The frontend uses it to render form fields. The API uses it to validate inputs.

```typescript
// Shared pattern: skill schemas drive both UI and validation
// Frontend: use zod-to-json-schema or manual mapping to render fields
// Backend: skill.inputSchema.parse(inputs) before agent call

// The API route validates:
export async function POST(request: Request) {
  const body = await request.json();
  const { skillId, inputs } = body;

  const skill = getSkill(skillId);
  if (!skill) return Response.json({ error: "Unknown skill" }, { status: 404 });

  try {
    const validatedInputs = skill.inputSchema.parse(inputs);
    // proceed with orchestration...
  } catch (e) {
    if (e instanceof z.ZodError) {
      return Response.json({ error: "Invalid inputs", details: e.errors }, { status: 400 });
    }
    throw e;
  }
}
```

### Error Handling and Retry Patterns

```typescript
// src/agents/skill-executor.ts (error handling addition)

export async function executeSkillAgent(
  skill: SkillConfig,
  inputs: Record<string, unknown>,
  jobId: string,
  jobStore: JobStore
): Promise<string> {
  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        jobStore.addEvent(jobId, {
          type: "progress",
          step: `Retrying (attempt ${attempt + 1})...`,
          percent: 5,
        });
      }
      return await callClaude(skill, inputs, jobId, jobStore);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors or 400s
      if (isNonRetryable(error)) throw error;

      // Retry on rate limits (429) with backoff
      if (isRateLimited(error)) {
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      // Retry on 500s or network errors
      if (isTransient(error)) {
        await sleep(1000);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function isNonRetryable(error: unknown): boolean {
  // 400, 401, 403, 404 - don't retry
  return error instanceof Anthropic.BadRequestError
    || error instanceof Anthropic.AuthenticationError;
}

function isRateLimited(error: unknown): boolean {
  return error instanceof Anthropic.RateLimitError;
}

function isTransient(error: unknown): boolean {
  return error instanceof Anthropic.InternalServerError
    || error instanceof Anthropic.APIConnectionError;
}
```

**Error reporting to frontend:**

```typescript
// In orchestrator, wrap everything:
try {
  await orchestrate(skillId, inputs, jobId, jobStore);
} catch (error) {
  jobStore.addEvent(jobId, {
    type: "error",
    error: error instanceof Error ? error.message : "Generation failed",
  });
}
```

---

## Output Pipeline Detail

Different skills need different output pipelines. This is where the real format-specific complexity lives.

| Skill | Agent Output | Pipeline | Final Format |
|-------|-------------|----------|--------------|
| Prompt Guide | HTML string | Wrap in styled template | .html |
| Email Templates | HTML string(s) | Wrap each in email-safe HTML | .html (zip if multiple) |
| Content Calendar | JSON structure | Render to styled HTML table | .html |
| Proposal Deck | JSON (slides array) | pptxgenjs builds .pptx | .pptx |
| Brand Guidelines | JSON (colors, fonts, rules) | Render to styled HTML brand book | .html |
| Icon Pack | Text descriptions | Replicate API generates PNGs | .zip (PNGs) |
| Motion Graphics | SVG markup + animation specs | Package SVGs + Lottie JSON | .zip (SVGs + JSON) |

**Key insight:** For "easy" and "medium" skills, Claude outputs either HTML directly or structured JSON that a template converts to HTML/PPTX. For "hard" skills, Claude outputs specifications that feed into external APIs (Replicate for images).

### Pipeline Architecture

```typescript
// src/pipelines/types.ts
export interface PipelineResult {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

export type OutputPipeline = (
  agentOutput: string,
  inputs: Record<string, unknown>
) => Promise<PipelineResult>;
```

```typescript
// src/pipelines/pptx.ts
import PptxGenJS from "pptxgenjs";

export const pptxPipeline: OutputPipeline = async (agentOutput, inputs) => {
  const slides = JSON.parse(agentOutput); // Agent outputs JSON slide structure
  const pptx = new PptxGenJS();

  for (const slide of slides) {
    const s = pptx.addSlide();
    // Map agent's structured output to pptxgenjs API calls
    if (slide.title) s.addText(slide.title, { ...titleStyle });
    if (slide.body) s.addText(slide.body, { ...bodyStyle });
    if (slide.bullets) { /* ... */ }
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return {
    filename: `${inputs.company}-proposal.pptx`,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    buffer: buffer as Buffer,
  };
};
```

---

## Scalability Considerations

This is a demo, not a SaaS product. Scalability is not a primary concern, but the architecture should not preclude it.

| Concern | Demo (current) | If scaled later |
|---------|---------------|-----------------|
| Job Store | In-memory Map | Redis or database |
| File Storage | Local /tmp/ | S3 or R2 |
| Concurrent jobs | Serial (one at a time OK for demo) | Queue (BullMQ or similar) |
| Agent calls | Direct API calls | Rate-limited queue |
| Cleanup | Manual or TTL in-memory | Cron job or lifecycle policy |

---

## Build Order (Dependencies)

The architecture has clear dependency layers. Build bottom-up:

```
Phase 1: Foundation (no agent calls needed to test)
  1. Skill registry + types + 1 example skill config
  2. Job store (in-memory)
  3. Zod schemas for input validation
  4. File storage utility (write to /tmp, serve via route)

Phase 2: Agent Layer (needs Anthropic API key)
  5. Anthropic client singleton
  6. Skill executor (single agent call with streaming)
  7. Orchestrator function (thin router)
  8. Error handling + retry logic

Phase 3: API Layer (connects agent to frontend)
  9. POST /api/generate (validate + start job)
  10. GET /api/generate/[jobId] (SSE stream)
  11. GET /api/download/[jobId] (file download)
  12. GET /api/skills (list skills for frontend)

Phase 4: Frontend (consumes API)
  13. Product grid (reads from /api/skills)
  14. Dynamic input form (rendered from skill schema)
  15. Progress panel (SSE consumer)
  16. Download button

Phase 5: Skills (one at a time, independent of each other)
  17. Easy skills (HTML output -- simplest pipeline)
  18. Medium skills (need pptxgenjs or complex HTML)
  19. Hard skills (need Replicate API integration)

Phase 6: Output Pipelines (per format)
  20. HTML pipeline (trivial -- wrap and serve)
  21. PPTX pipeline (pptxgenjs integration)
  22. Image pipeline (Replicate API)
  23. SVG/Lottie pipeline
```

**Critical path:** Phases 1-4 form the skeleton. Once the skeleton works with ONE skill (e.g., Prompt Guide outputting HTML), all other skills can be added in parallel.

**Key dependency:** Phase 5 (skills) and Phase 6 (pipelines) can be built in parallel, but a skill is not "done" until its pipeline works.

---

## Technology Boundary Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Orchestrator: Claude agent vs TypeScript function? | **TypeScript function** | User already selects the skill. No AI reasoning needed for routing. |
| Streaming: WebSocket vs SSE? | **SSE** | One-directional (server to client) is all we need. SSE is simpler, supported by Next.js Route Handlers natively. |
| Job tracking: Database vs in-memory? | **In-memory** | Demo app, no persistence needed. Restarting the server losing jobs is acceptable. |
| File generation: Stream to client vs save-then-download? | **Save then download** | Agents produce complete outputs. No benefit to partial streaming. Save to disk, serve via download route. |
| Form rendering: Static per-skill vs dynamic from schema? | **Dynamic from Zod schema** | One form component that renders any skill's inputs. Adding a skill should not require a new form component. |
| Claude model for skills: Sonnet vs Haiku vs Opus? | **Sonnet for most, Haiku for simple** | Cost/quality tradeoff. Easy skills (prompt guides) could use Haiku. Medium/Hard skills need Sonnet. |

---

## Sources

- Anthropic TypeScript SDK documentation (training data, MEDIUM confidence -- verify streaming API)
- Next.js App Router Route Handlers (training data, HIGH confidence -- well-established pattern)
- pptxgenjs library (training data, MEDIUM confidence -- verify current API)
- SSE pattern with ReadableStream (training data, HIGH confidence -- standard Web API)
- Zod schema validation (training data, HIGH confidence -- stable, widely used)

**Items to verify before implementation:**
1. Exact streaming API for `@anthropic-ai/sdk` -- confirm `client.messages.stream()` and event names
2. pptxgenjs API for `write({ outputType: "nodebuffer" })` -- may have changed
3. Replicate API for image generation -- need to research current models and SDK
4. Next.js App Router SSE -- confirm no edge-case issues with `ReadableStream` in route handlers
