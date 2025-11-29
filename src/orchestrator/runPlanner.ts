import { savePlannerOutput } from "@/tools/fsTools";
import { runPlannerAgent } from "@/agents/plannerAgent";

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
