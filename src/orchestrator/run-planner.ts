import plannerAgent from "@/agents/planner-agent";
import { savePlannerOutput } from "@/tools/fsTools";
import { saveMarkdown } from "@/tools/save-markdown";
import type { PlannerOutput } from "@/types/plannerTypes";
import { formatPlanToMarkdown } from "@/tools/format-plan-to-markdown";

/**
 * Parses command line arguments to extract the task ID.
 * 
 * @returns {string} The extracted task ID.
 * @throws {Error} If the taskId argument is missing.
 */
function parseArgs() {
    const a = process.argv.find((x) => x.startsWith("--taskId="));
    if (!a) throw new Error("Usage: --taskId=<ID>");
    return a.split("=")[1];
}

/**
 * Saves the generated plan to both JSON and Markdown formats.
 * 
 * The JSON output saved by this function is consumed by the Execution Agent
 * (implemented in `src/orchestrator/run-execution.ts`) to generate actual code changes.
 * 
 * @param {PlannerOutput} plan - The generated plan object.
 * @param {string} taskId - The ID of the task.
 */
async function savePlan(plan: PlannerOutput, taskId: string) {
    const { jsonPath } = await savePlannerOutput(plan);
    const markdown = formatPlanToMarkdown(plan);
    const markdownPath = await saveMarkdown(markdown, taskId);

    console.log(`[planner] JSON saved at: ${jsonPath}`);
    console.log(`[planner] Markdown saved at: ${markdownPath}`);
}

/**
 * Main entry point for the planner orchestrator.
 * 
 * Orchestrates the planning process:
 * 1. Parses the task ID.
 * 2. Runs the planner agent to generate the plan.
 * 3. Saves the plan to disk (JSON and Markdown).
 * 
 * Handles errors by logging them and exiting with code 1.
 */
async function runPlanner() {
    try {
        const id = parseArgs();
        console.log(`[planner] Running for task ${id}...`);
        const plan = await plannerAgent(id);

        await savePlan(plan, id);
    } catch (err) {
        console.error("[planner] Error:", err);
        process.exit(1);
    }
}

runPlanner();
