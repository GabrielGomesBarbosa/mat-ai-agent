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
