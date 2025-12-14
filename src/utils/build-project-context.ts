import fs from "node:fs";
import path from "node:path";

const CONTEXT_DIR = path.resolve(process.cwd(), "context");
const OUTPUT_FILE = "project-context.md";

export function buildProjectContext(): string {
    if (!fs.existsSync(CONTEXT_DIR)) {
        console.warn("⚠ No /context folder found. Returning empty context.");
        return "";
    }

    const files = fs.readdirSync(CONTEXT_DIR).filter(f =>
        (f.endsWith(".md") || f.endsWith(".txt")) && f !== OUTPUT_FILE
    );

    let output = "### PROJECT CONTEXT\n\n";

    for (const file of files) {
        const fullPath = path.join(CONTEXT_DIR, file);
        const content = fs.readFileSync(fullPath, "utf8");

        output += `\n\n---\n# FILE: ${file}\n\n`;
        output += content;
    }

    const outputPath = path.join(CONTEXT_DIR, OUTPUT_FILE);
    fs.writeFileSync(outputPath, output, "utf8");

    return output;
}


buildProjectContext()