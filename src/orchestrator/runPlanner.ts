import { savePlannerOutput } from "@/tools/fsTools";
import { saveMarkdown } from "@/tools/save-markdown";
import { runPlannerAgent } from "@/agents/plannerAgent";
import { formatPlanToMarkdown } from "@/tools/format-plan-to-markdown";

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

        const markdown = formatPlanToMarkdown(plan);
        const markdownPath = await saveMarkdown(markdown, id);
        console.log(`[planner] Markdown saved at: ${markdownPath}`);
    } catch (err) {
        console.error("[planner] Error:", err);
        process.exit(1);
    }
}

main();
