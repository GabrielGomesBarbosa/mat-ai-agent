import fs from "node:fs";
import path from "node:path";

import { env } from "@/config/env";
import { RepoIndex } from "@/types/repo-index";
import { LoadedFile } from "@/types/loaded-file";
import { toPosixPath } from "@/utils/to-posix-path";

if (!env.frontendRepoPath)
    throw new Error("FRONTEND_REPO_PATH missing in .env");

const repoRootPath = path.resolve(env.frontendRepoPath);
const indexJsonPath = path.resolve(process.cwd(), "repo-index.json");

let repoIndex: RepoIndex;

try {
    if (!fs.existsSync(indexJsonPath)) {
        throw new Error("repo-index.json not found. Run 'npm run index:repo' first.");
    }

    const raw = fs.readFileSync(indexJsonPath, "utf8");
    repoIndex = JSON.parse(raw) as RepoIndex;
} catch (error) {
    console.error("❌ Failed to load repo index:", error);
    process.exit(1);
}

/**
 * Verifies that a file exists in the pre-loaded repository index.
 * This acts as a safeguard against "hallucinated" file paths from the AI planner.
 *
 * @param relPath - The relative path of the file to check
 * @throws {Error} If the file is not found in the index
 *
 * @example
 * fileExistsInRepoIndex("src/App.tsx"); // Passes if file is in index
 * fileExistsInRepoIndex("src/ghost-file.ts"); // Throws Error
 */
function fileExistsInRepoIndex(relPath: string) {
    const exists = repoIndex.files.some(f => toPosixPath(f.path) === toPosixPath(relPath));

    if (!exists) {
        throw new Error(
            `File not found in repo-index.json: ${relPath}\n` +
            'The planner may have hallucinated this file.'
        );
    }
}

/**
 * Loads real content of multiple files from the repository.
 * Validates that each file exists in the index and physically on disk.
 * It's:
 *  - Loads file content from disk
 *  - Rejects non-indexed files
 *  - Rejects non-existing files on disk
 *
 * @param paths - Array of relative file paths to load
 * @returns A promise resolving to an array of loaded file objects
 * @throws {Error} If a file is not in the index or physically missing
 *
 * @example
 * const files = await loadFiles(["src/utils.ts", "package.json"]);
 * // Returns:
 * // [
 * //   { path: "src/utils.ts", absolutePath: "/abs/path/src/utils.ts", content: "..." },
 * //   { path: "package.json", absolutePath: "/abs/path/package.json", content: "..." }
 * // ]
 */
export async function loadRepoFiles(paths: string[]): Promise<LoadedFile[]> {
    const results: LoadedFile[] = [];

    for (const relPath of paths) {
        fileExistsInRepoIndex(relPath);

        const absPath = path.join(repoRootPath, relPath);
        const normalized = toPosixPath(absPath);

        console.log(`Loading file: ${absPath}`);

        if (!fs.existsSync(absPath)) {
            throw new Error(`File physically missing: ${absPath}`);
        }

        const content = fs.readFileSync(absPath, "utf8");

        results.push({
            path: toPosixPath(relPath),
            absolutePath: normalized,
            content
        });
    }

    return results;
}
