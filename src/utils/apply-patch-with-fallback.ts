import fs from "node:fs";
import path from "node:path";
import { applyPatch } from "diff";
import { execSync } from "node:child_process";

import { normalizeDiff } from "./normalize-diff";

/**
 * Applies a patch to a file using a robust 3-strategy fallback system.
 * 
 * AI-generated diffs are often imperfect (e.g., wrong line counts, full-file replacements, 
 * whitespace mismatches). This function attempts to apply the patch using the following strategies 
 * in order:
 * 
 * 1. **Original Diff (JS)**: Uses `diff` library with the raw AI output.
 * 2. **Fixed Diff (JS)**: Pre-processes the diff using `normalizeDiff` (corrects headers, whitespace, full-file diffs) 
 *    and retries with the `diff` library.
 * 3. **Native Patch Command (System)**: Uses the system's `patch` command with `--ignore-whitespace`. 
 *    This is the most forgiving strategy but requires the file to be written to disk temporarily.
 * 
 * @param originalContent - The current content of the file to modify.
 * @param diff - The unified diff string provided by the AI.
 * @param filePath - Optional file path. Required for Strategy 3 (native patch command) to handle temporary files correctly.
 * @returns An object indicating success or failure.
 * 
 * @example
 * const result = applyPatchWithFallback(
 *   "console.log('hello')",
 *   "@@ -1,1 +1,1 @@\n-console.log('hello')\n+console.log('world')",
 *   "/src/main.ts"
 * );
 * 
 * if (result.success) {
 *   fs.writeFileSync("/src/main.ts", result.content);
 * }
 */
export default function applyPatchWithFallback(
    originalContent: string,
    diff: string,
    filePath?: string
): { success: boolean; content?: string; error?: string } {
    console.log("\n=== Patch Application ===");

    try {
        console.log("Strategy 1: diff library with original...");
        const result = applyPatch(originalContent, diff);
        if (result !== false) {
            console.log("✓ Success");
            return { success: true, content: result };
        }
    } catch (err: any) {
        console.log(`✗ Failed: ${err.message}`);
    }

    try {
        console.log("Strategy 2: diff library with fixes...");
        const fixedDiff = normalizeDiff(diff, originalContent);

        const result = applyPatch(originalContent, fixedDiff);
        if (result !== false) {
            console.log("✓ Success");
            return { success: true, content: result };
        }
    } catch (err: any) {
        console.log(`✗ Failed: ${err.message}`);
    }

    if (filePath) {
        try {
            console.log("Strategy 3: patch command...");

            const tmpDir = `/tmp/patch-${Date.now()}`;
            fs.mkdirSync(tmpDir, { recursive: true });

            const tmpFile = path.join(tmpDir, path.basename(filePath));
            const tmpDiff = path.join(tmpDir, 'changes.patch');

            fs.writeFileSync(tmpFile, originalContent, 'utf8');
            const fixedDiff = normalizeDiff(diff, originalContent);
            fs.writeFileSync(tmpDiff, fixedDiff, 'utf8');

            try {
                execSync(`patch --ignore-whitespace "${tmpFile}" < "${tmpDiff}"`, {
                    cwd: tmpDir,
                    stdio: 'pipe'
                });

                const result = fs.readFileSync(tmpFile, 'utf8');
                console.log("✓ Success with patch command");

                fs.rmSync(tmpDir, { recursive: true });

                return { success: true, content: result };
            } catch (patchErr) {
                fs.rmSync(tmpDir, { recursive: true });
                throw patchErr;
            }
        } catch (err: any) {
            console.log(`✗ Failed: ${err.message}`);
        }
    }

    return {
        success: false,
        error: "Patch rejected - unable to apply with any strategy"
    };
}
