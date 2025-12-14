import fs from "node:fs";
import path from "node:path";

import type { ExecutorOutput } from "@/types/executor-output";

export type ExecutionManifest = {
    plan: string;
    projectDocsContext: string;
    filesLoaded: string[];
    executorOutput: ExecutorOutput; // We keep the output here as part of the manifest record
    diffPaths: string[];
};

/**
 * Saves the execution manifest (inputs, context, and outputs) to a JSON file.
 * This serves as a complete record of the execution run.
 * 
 * @param folder The execution folder path (e.g., "executions/1765692907016")
 * @param data The manifest data to save
 * 
 * @example
 * const manifest = {
 *   plan: "...",                // The original implementation plan JSON
 *   projectDocsContext: "...",  // The project documentation context used
 *   filesLoaded: ["src/app.tsx"], // Files that were loaded for the AI
 *   executorOutput: { ... },    // The full output from the AI agent
 *   diffPaths: ["executions/123/diff-src__app.tsx.patch"]
 * };
 * 
 * saveExecutionManifest("/path/to/executions/123", manifest);
 * // Creates: /path/to/executions/123/execution-manifest.json
 */
export function saveExecutionManifest(folder: string, data: ExecutionManifest): void {
    const outPath = path.join(folder, "execution-manifest.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Manifest saved to: ${outPath}`);
}
