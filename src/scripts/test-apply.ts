import fs from "node:fs";
import path from "node:path";

import { runApply } from "@/orchestrator/run-apply";

async function main() {
    const folder = path.join(process.cwd(), "executions");

    const items = fs.readdirSync(folder);
    const latest = items.sort().reverse()[0];

    if (!latest) {
        console.error("❌ No execution folders found.");
        process.exit(1);
    }

    const EXECUTION_PATH = path.join(folder, latest);
    const EXECUTOR_OUTPUT_PATH = path.join(EXECUTION_PATH, "executor-output.json");

    if (!fs.existsSync(EXECUTOR_OUTPUT_PATH)) {
        console.error("❌ executor-output.json not found in", EXECUTION_PATH);
        process.exit(1);
    }

    const executorOutput = JSON.parse(fs.readFileSync(EXECUTOR_OUTPUT_PATH, "utf8"));

    console.log("🛠 Applying patches for execution:", latest);

    const results = await runApply(executorOutput);

    console.log("✨ Done.");
    console.log(results);
}

main().catch(err => {
    console.error("❌ Apply error:", err);
    process.exit(1);
});
