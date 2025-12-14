import fs from "node:fs";
import path from "node:path";

/**
 * Saves a unified diff content to a .patch file in the specified folder.
 * The filename is sanitized to avoid directory traversal or invalid characters.
 * 
 * @param folder - The directory where the patch file should be saved.
 * @param filePath - The original file path the diff applies to (used for naming).
 * @param diff - The unified diff content string.
 * @returns The absolute path to the saved patch file.
 * 
 * @example
 * const patchPath = saveDiffFile(
 *   "/executions/123", 
 *   "src/components/App.tsx", 
 *   "diff content..."
 * );
 * // Creates: /executions/123/diff-src__components__App.tsx.patch
 */
export function saveDiffFile(folder: string, filePath: string, diff: string): string {
    const safeName = filePath.replace(/[\\/]/g, "__");
    const outPath = path.join(folder, `diff-${safeName}.patch`);
    fs.writeFileSync(outPath, diff, "utf8");
    return outPath;
}
