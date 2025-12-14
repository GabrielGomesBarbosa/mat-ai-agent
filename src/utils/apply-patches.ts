import fs from "node:fs";
import path from "node:path";

import { env } from "@/config/env";
import normalizePath from "@/utils/normalize-path";
import type { ExecutorOutput } from "@/types/executor-output";
import applyPatchWithFallback from "@/utils/apply-patch-with-fallback";

/**
 * Result of a single file patch operation.
 */
export type PatchResult = {
    /** The relative path of the file that was modified. */
    file: string;
    /** Whether the patch was applied successfully. */
    success: boolean;
    /** Error message if the patch failed. */
    error?: string;
};

/**
 * Applies all patches from the Executor Agent's output to the actual repository.
 * 
 * Iterates through each modification and:
 * 1. Verifies the target file exists.
 * 2. Creates a backup of the original file (.backup).
 * 3. Attempts to apply the patch using `applyPatchWithFallback`.
 * 4. If successful: Overwrites the file and deletes the backup.
 * 5. If failed: Preserves the backup and logs the error.
 * 
 * @param output - The JSON output from the Executor Agent containing modifications.
 * @returns Array of results indicating success/failure for each file.
 */
export async function applyPatches(output: ExecutorOutput): Promise<PatchResult[]> {
    const repoRoot = path.resolve(env.frontendRepoPath);

    const results: PatchResult[] = [];

    for (const mod of output.modifications) {
        const rel = normalizePath(mod.path);
        const abs = path.join(repoRoot, rel);

        if (!fs.existsSync(abs)) {
            results.push({
                file: rel,
                success: false,
                error: "File does not exist on disk."
            });
            continue;
        }

        const original = fs.readFileSync(abs, "utf8");

        const backupPath = abs + ".backup";
        fs.writeFileSync(backupPath, original, "utf8");

        const patchResult = applyPatchWithFallback(original, mod.diff, abs);

        if (!patchResult.success || !patchResult.content) {
            console.warn(`⚠️  Backup preserved at: ${backupPath}`);
            results.push({
                file: rel,
                success: false,
                error: patchResult.error || "Patch application failed"
            });
            continue;
        }

        fs.writeFileSync(abs, patchResult.content, "utf8");

        try {
            fs.unlinkSync(backupPath);
        } catch (err) {
            console.warn(`⚠️  Could not remove backup file: ${backupPath}`);
        }

        results.push({
            file: rel,
            success: true
        });
    }

    return results;
}
