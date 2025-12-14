import { ExecutorOutput } from "@/types/executor-output";
import { applyPatches, PatchResult } from "@/utils/apply-patches";

/**
 * Orchestrates the patch application process.
 * 
 * This function serves as the high-level entry point for applying changes.
 * It coordinates the core `applyPatches` utility and handles user-facing logging/feedback.
 * 
 * @param output - The output from the Executor Agent containing the diffs to apply.
 * @returns An array of results for each file modification.
 * 
 * @example
 * const results = await runApply(executorOutput);
 * // Logs: "✔ Updated: src/app.tsx"
 */
export async function runApply(
    output: ExecutorOutput
): Promise<PatchResult[]> {
    console.log("🛠 Applying patches to repository...");

    const results = await applyPatches(output);

    for (const r of results) {
        if (r.success) {
            console.log(`✔ Updated: ${r.file}`);
        } else {
            console.log(`❌ Failed: ${r.file} → ${r.error}`);
        }
    }

    console.log("✨ Patch operation complete.");
    return results;
}
