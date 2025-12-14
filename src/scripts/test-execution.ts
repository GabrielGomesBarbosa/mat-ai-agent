import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { runExecution } from "@/orchestrator/run-execution";

async function main() {

    console.log("Reading plan file...");
    const jsonPlanContent = readFileSync("plans/task-123.json", "utf-8");

    console.log("Reading context file...");
    const projectDocsContext = readFileSync("generated/memory/project-context.md", "utf-8");

    console.log("Running execution...");
    const result = await runExecution({
        jsonPlanContent,
        projectDocsContext,
    });

    const executorOutPath = path.join(result.savedDiffsPath, "executor-output.json");
    writeFileSync(executorOutPath, JSON.stringify(result.output, null, 2), "utf8");

    console.log("Executor output stored at:", executorOutPath);
}

main();