import fs from "node:fs";
import path from "node:path";
import { env } from "@/config/env";

const FRONTEND_REPO_PATH = env.frontendRepoPath;
const OUTPUT_DIR = path.resolve(process.cwd(), "generated/memory");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "project-context.md");

export function buildProjectContext(): string {
    if (!FRONTEND_REPO_PATH || !fs.existsSync(FRONTEND_REPO_PATH)) {
        console.warn(`⚠ FRONTEND_REPO_PATH not found or invalid: ${FRONTEND_REPO_PATH}`);
        return "";
    }

    const docsDir = path.join(FRONTEND_REPO_PATH, "docs");
    const claudeFile = path.join(FRONTEND_REPO_PATH, "CLAUDE.md");

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let output = "### PROJECT CONTEXT";

    if (fs.existsSync(claudeFile)) {
        const content = fs.readFileSync(claudeFile, "utf8");
        output += `\n\n---\n# FILE: CLAUDE.md\n\n`;
        output += content;
    }

    if (fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".md"));

        for (const file of files) {
            const fullPath = path.join(docsDir, file);
            const content = fs.readFileSync(fullPath, "utf8");

            output += `\n\n---\n# FILE: docs/${file}\n\n`;
            output += content;
        }
    } else {
        console.warn(`⚠ Docs folder not found at: ${docsDir}`);
    }

    fs.writeFileSync(OUTPUT_FILE, output, "utf8");
    console.log(`✓ Project context generated at: ${OUTPUT_FILE}`);

    return output;
}

buildProjectContext();