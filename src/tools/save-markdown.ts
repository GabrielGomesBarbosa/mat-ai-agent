import path from "node:path";
import fs from "node:fs/promises";

export async function saveMarkdown(markdown: string, taskId: string): Promise<string> {
    const filePath = path.join(process.cwd(), "plans", `task-${taskId}.md`);

    await fs.writeFile(filePath, markdown, "utf8");

    return filePath;
}
