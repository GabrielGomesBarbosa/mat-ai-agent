# AI RECIPE: Frontend Planner Agent (Node.js + TypeScript + OpenAI + Monday)

You are an AI coding assistant inside the user's editor.\
Your job is to scaffold a **Node.js + TypeScript** project that
implements a **Planner Agent**:

-   Runtime: **Node.js CLI**
-   Language: **TypeScript**
-   AI Provider: **OpenAI API**
-   Monday Integration: **Direct REST/GraphQL API**
-   Project Docs Location: `./context/*.md`
-   Output: JSON (and optional Markdown) implementation plan for a given
    Monday task.

The user will later fill in more logic with another AI assistant, so
keep the structure clean, minimal, and well documented.

------------------------------------------------------------------------

## 1. Project Setup

1.  Initialize a Node.js project with TypeScript:

    -   Create a new Node.js project (no framework).
    -   Add TypeScript and basic tooling.

2.  `package.json`:

    -   Set `"type": "module"` (use ES modules).
    -   Add scripts:

    ``` jsonc
    {
      "scripts": {
        "dev": "tsx src/orchestrator/runPlanner.ts --taskId",
        "planner": "node dist/orchestrator/runPlanner.js --taskId",
        "build": "tsc"
      }
    }
    ```

    The `planner` script will be used like:

    ``` bash
    npm run planner -- --taskId=12345
    ```

3.  Dependencies:

    -   Runtime:
        -   `"openai": "^4.0.0"`
        -   `"axios": "^1.7.0"`
        -   `"dotenv": "^16.4.0"`
    -   Dev:
        -   `"typescript": "^5.6.0"`
        -   `"tsx": "^4.0.0"`
        -   `"@types/node": "^22.0.0"`

4.  `tsconfig.json`:

    -   Target: ES2020 or later\
    -   Module: ESNext\
    -   Root dir: `src`\
    -   Out dir: `dist`\
    -   Strict mode: enabled

------------------------------------------------------------------------

## 2. Folder Structure

Create this structure:

``` txt
.
├─ package.json                      # Project metadata, dependencies, scripts
├─ tsconfig.json                     # TypeScript compiler configuration
├─ .env.example                      # Template for environment variables
├─ AGENT_RECIPE.md                   # The recipe used by Copilot/Claude to scaffold the project
│
├─ context/                          # Your project documentation (READ BY THE AGENT)
│  └─ project-context.md             # High-level docs: architecture, DS, conventions, folder structure
│
├─ plans/                            # All generated implementation plans (output)
│                                     # E.g. plans/task-123.json
│
├─ src/
│  ├─ config/
│  │  └─ env.ts                      # Loads environment variables and validates required fields
│  │
│  ├─ types/
│  │  └─ plannerTypes.ts             # TypeScript definitions for PlannerAgent JSON output
│  │                                  # Ensures the LLM output follows a predictable schema
│  │
│  ├─ prompts/
│  │  └─ plannerPrompt.ts            # Template + builder for PlannerAgent prompt sent to OpenAI API
│  │                                  # Injects Monday task + context docs + rules
│  │
│  ├─ tools/
│  │  ├─ monday.ts                   # Direct Monday API client (fetches task title/description)
│  │  ├─ docs.ts                     # Loads all markdown files in /context and merges them
│  │  └─ fsTools.ts                  # Utility for writing JSON/Markdown output to /plans folder
│  │
│  ├─ retrieval/                     # (Future Phase) Code retrieval + indexing logic
│  │  ├─ indexRepo.ts                # Scans entire repo and builds an index of files (names, sizes, imports)
│  │  └─ findRelevantFiles.ts        # Filters relevant files based on task keywords + repo index
│  │                                  # Not used in Phase 1, placeholder for Phase 2/3
│  │
│  ├─ agents/
│  │  └─ plannerAgent.ts             # MAIN agent logic:
│  │                                  #  - Loads docs
│  │                                  #  - Fetches Monday task
│  │                                  #  - Builds prompt
│  │                                  #  - Calls OpenAI model
│  │                                  #  - Parses JSON output into PlannerOutput
│  │
│  └─ orchestrator/
│     └─ runPlanner.ts               # CLI entry:
│                                     #  - Reads taskId from CLI args
│                                     #  - Calls PlannerAgent
│                                     #  - Saves plan using fsTools
│                                     #  - Logs summary to console

```

------------------------------------------------------------------------

## 3. Environment Configuration

`.env.example`:

``` bash
OPENAI_API_KEY=your_openai_api_key_here
MONDAY_API_TOKEN=your_monday_api_token_here
MONDAY_API_URL=https://api.monday.com/v2
```

`src/config/env.ts`:

``` ts
import "dotenv/config";

export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  mondayToken: process.env.MONDAY_API_TOKEN ?? "",
  mondayUrl: process.env.MONDAY_API_URL ?? "https://api.monday.com/v2"
};

if (!env.openaiApiKey) throw new Error("Missing OPENAI_API_KEY");
if (!env.mondayToken) throw new Error("Missing MONDAY_API_TOKEN");
```

------------------------------------------------------------------------

## 4. Planner Types

`src/types/plannerTypes.ts`:

``` ts
export type PlannerTaskInfo = {
  id: string;
  title: string;
  description: string;
};

export type PlannerScope = {
  featureType: string;
  frontendType: string;
  screens: string[];
  components: string[];
  modules: string[];
  apiCalls: string[];
};

export type PlannerImplementation = {
  steps: string[];
  filesToCreate: string[];
  filesToModify: string[];
  designSystemNotes: string;
  technicalConstraints: string[];
};

export type PlannerTests = {
  unitTests: string[];
  integrationTests: string[];
  manualChecks: string[];
};

export type PlannerOutput = {
  task: PlannerTaskInfo;
  summary: string;
  userStory: string;
  acceptanceCriteria: string[];
  scope: PlannerScope;
  implementation: PlannerImplementation;
  tests: PlannerTests;
  risks: string[];
  dependencies: string[];
  outOfScope: string[];
  estimatedComplexity: "low" | "medium" | "high";
  missingInformation: string[];
  confidence: number;
};
```

------------------------------------------------------------------------

## 5. Project Docs Loader

`src/tools/docs.ts`:

``` ts
import fs from "fs/promises";
import path from "path";

export async function loadProjectDocs(): Promise<string> {
  const dir = path.join(process.cwd(), "context");
  let result = "";

  try {
    const files = await fs.readdir(dir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const full = path.join(dir, file);
      const content = await fs.readFile(full, "utf8");
      result += `\n\n# Context file: ${file}\n\n${content}\n`;
    }
  } catch {
    result = "";
  }

  return result.trim();
}
```

------------------------------------------------------------------------

## 6. Monday Tool

`src/tools/monday.ts`:

``` ts
import axios from "axios";
import { env } from "../config/env";

export type MondayTask = {
  id: string;
  title: string;
  description: string;
};

export async function getMondayTaskById(taskId: string): Promise<MondayTask> {
  const query = `
    query ($ids: [ID!]) {
      items (ids: $ids) {
        id
        name
        column_values {
          id
          text
        }
      }
    }
  `;

  const variables = { ids: [taskId] };

  const res = await axios.post(
    env.mondayUrl,
    { query, variables },
    {
      headers: {
        Authorization: env.mondayToken,
        "Content-Type": "application/json",
      },
    }
  );

  const item = res.data?.data?.items?.[0];

  if (!item) throw new Error(`Monday item not found: ${taskId}`);

  const descCol =
    item.column_values?.find((c: any) => c.id === "description") ??
    item.column_values?.[0];

  return {
    id: String(item.id),
    title: item.name ?? "",
    description: descCol?.text ?? "",
  };
}
```

------------------------------------------------------------------------

## 7. File System Helpers

`src/tools/fsTools.ts`:

``` ts
import fs from "fs/promises";
import path from "path";
import type { PlannerOutput } from "../types/plannerTypes";

const dir = path.join(process.cwd(), "plans");

async function ensure() {
  await fs.mkdir(dir, { recursive: true });
}

export async function savePlannerOutput(
  output: PlannerOutput
): Promise<{ jsonPath: string }> {
  await ensure();
  const file = `task-${output.task.id}.json`;
  const full = path.join(dir, file);
  await fs.writeFile(full, JSON.stringify(output, null, 2), "utf8");
  return { jsonPath: full };
}
```

------------------------------------------------------------------------

## 8. Planner Prompt

`src/prompts/plannerPrompt.ts`:

``` ts
export function buildPlannerPrompt(args: {
  projectDocs: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
}) {
  return `
You are a Senior Frontend Architect AI.

Generate a structured IMPLEMENTATION PLAN as valid JSON.
Follow the PlannerOutput schema strictly.

GUIDELINES:
- Do not write code.
- Do not modify files.
- Be concise & deterministic.
- If unsure, add entries under "missingInformation".
- Use project docs exactly as provided.

PROJECT CONTEXT:
${args.projectDocs || "(none provided)"}

TASK ID: ${args.taskId}
TITLE: ${args.taskTitle}
DESCRIPTION:
${args.taskDescription}

Return ONLY a JSON object.
`;
}
```

------------------------------------------------------------------------

## 9. Planner Agent Implementation

`src/agents/plannerAgent.ts`:

``` ts
import OpenAI from "openai";
import { env } from "../config/env";
import { loadProjectDocs } from "../tools/docs";
import { getMondayTaskById } from "../tools/monday";
import { buildPlannerPrompt } from "../prompts/plannerPrompt";
import type { PlannerOutput } from "../types/plannerTypes";

const client = new OpenAI({ apiKey: env.openaiApiKey });

export async function runPlannerAgent(taskId: string): Promise<PlannerOutput> {
  const [projectDocs, task] = await Promise.all([
    loadProjectDocs(),
    getMondayTaskById(taskId),
  ]);

  const prompt = buildPlannerPrompt({
    projectDocs,
    taskId,
    taskTitle: task.title,
    taskDescription: task.description,
  });

  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You output JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(completion.choices[0].message.content ?? "{}");
}
```

------------------------------------------------------------------------

## 10. Orchestrator (CLI Entry Point)

`src/orchestrator/runPlanner.ts`:

``` ts
import { runPlannerAgent } from "../agents/plannerAgent";
import { savePlannerOutput } from "../tools/fsTools";

function parseArgs() {
  const a = process.argv.find((x) => x.startsWith("--taskId="));
  if (!a) throw new Error("Usage: --taskId=<ID>");
  return a.split("=")[1];
}

async function main() {
  try {
    const id = parseArgs();
    console.log(`[planner] Running for task ${id}...`);
    const plan = await runPlannerAgent(id);
    const { jsonPath } = await savePlannerOutput(plan);
    console.log(`[planner] JSON saved at: ${jsonPath}`);
    console.log(`[planner] Summary:`, plan.summary);
  } catch (err) {
    console.error("[planner] Error:", err);
    process.exit(1);
  }
}

main();
```

------------------------------------------------------------------------

## 11. Retrieval Module (Placeholders)

`src/retrieval/indexRepo.ts`:

``` ts
export function indexRepo() {
  // TODO: scan repo & build index
  return {};
}
```

`src/retrieval/findRelevantFiles.ts`:

``` ts
export function findRelevantFiles() {
  // TODO: load index & match task keywords
  return [];
}
```

------------------------------------------------------------------------

## 12. Usage Instructions

1.  Add your project documentation into `./context/*.md`.
2.  Copy `.env.example` → `.env` and fill:

``` bash
OPENAI_API_KEY=...
MONDAY_API_TOKEN=...
```

3.  Install dependencies:

``` bash
npm install
```

4.  Development mode:

``` bash
npm run dev -- --taskId=123
```

5.  Build:

``` bash
npm run build
```

6.  Run planner:

``` bash
npm run planner -- --taskId=123
```

------------------------------------------------------------------------

## End of Recipe
