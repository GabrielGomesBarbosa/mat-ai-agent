import fs from "node:fs";
import path from "node:path";

import { env } from "@/config/env";
import type { RepoIndex, RepoFileEntry } from "@/types/repo-index";

import { classifyFile } from "./classify-file";
import { extractComponentName } from "./extract-component-name";
import { extractImportsAndExports } from "./extract-imports-exports";

if (!env.frontendRepoPath) {
    console.error("❌ FRONTEND_REPO_PATH missing in .env");
    process.exit(1);
}

const repoRoot = path.resolve(env.frontendRepoPath);

const CODE_EXT = [".ts", ".tsx", ".js", ".jsx"];

function scanDirectory(dir: string): string[] {
    let results: string[] = [];

    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            if (
                ["node_modules", "dist", "build", ".next", ".git", ".claude", ".github", "husk", ".nyc_output", ".vscode", "coverage"].some((skip) =>
                    full.includes(skip)
                )
            ) {
                continue;
            }

            results = results.concat(scanDirectory(full));
        } else {
            if (CODE_EXT.includes(path.extname(item))) {
                results.push(full);
            }
        }
    }

    return results;
}

function buildRepoIndex(): RepoIndex {
    console.log(`📁 Indexing repo at: ${repoRoot}`);

    const absoluteFiles = scanDirectory(repoRoot);
    const entries: RepoFileEntry[] = [];

    for (const absPath of absoluteFiles) {
        const relPath = path
            .relative(repoRoot, absPath)
            .replace(/\\/g, "/");

        const stat = fs.statSync(absPath);
        const content = fs.readFileSync(absPath, "utf8");

        const type = classifyFile(relPath);
        const componentName = extractComponentName(content);
        const { imports, exports } = extractImportsAndExports(content);

        const symbols = Array.from(new Set([...imports, ...exports, componentName].filter(Boolean))) as string[];

        const entry: RepoFileEntry = {
            path: relPath,
            type,
            size: stat.size,
            lastModified: stat.mtimeMs,
            componentName,
            imports: imports.length > 0 ? imports : undefined,
            exports: exports.length > 0 ? exports : undefined,
            symbols: symbols.length > 0 ? symbols : undefined,
        };

        entries.push(entry);
    }

    return {
        generatedAt: new Date().toISOString(),
        root: repoRoot,
        files: entries,
    };
}

function saveRepoIndex(index: RepoIndex) {
    const generatedDir = path.resolve(process.cwd(), "generated");
    if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
    }
    const outputPath = path.join(generatedDir, "repo-index.json");
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    console.log(`✅ repo-index.json created at ${outputPath}!`);
}

const index = buildRepoIndex();
saveRepoIndex(index);
