import path from "node:path";
import fs from "node:fs/promises";

import type { PlannerOutput } from "@/types/plannerTypes";

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
