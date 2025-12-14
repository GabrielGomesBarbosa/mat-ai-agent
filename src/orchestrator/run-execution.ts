import { saveDiffFile } from "@/utils/save-diff-file";
import { loadRepoFiles } from "@/repo/load-repo-files";
import { runExecutorAgent } from "@/agents/executor-agent";
import { parsePlannerOutput } from "@/utils/parse-planner-output";
import { saveExecutionManifest } from "@/utils/save-execution-manifest";
import { createExecutionFolder } from "@/utils/create-execution-folder";
import type { ExecutionParams, ExecutionResult } from "@/types/execution";

/**
 * Orchestrates the execution workflow of the Mat AI Agent.
 * 
 * This function takes the planner output and project documentation context to generate
 * unified diffs for all files that need to be modified. It validates file paths,
 * loads real file contents, and uses the Executor Agent to generate precise diffs.
 * 
 * @param params - Execution parameters containing planner output and project context
 * @param params.jsonPlanContent - The complete JSON plan from the Planner Agent.
 *                                  Must contain `implementation.filesToModify` array.
 * @param params.projectDocsContext - Concatenated project documentation from `/context` folder.
 *                                     Used to provide architectural context to the Executor Agent.
 * 
 * @returns A promise that resolves to the execution result containing:
 *          - `id`: Unique execution identifier (timestamp-based)
 *          - `output`: The ExecutorOutput with all generated modifications
 *          - `savedDiffsPath`: Absolute path to the execution folder containing diffs
 * 
 * @throws {Error} If the planner JSON is invalid or cannot be parsed
 * @throws {Error} If `implementation.filesToModify` is missing or empty
 * @throws {Error} If any file in `filesToModify` doesn't exist in the repo index
 * @throws {Error} If the Executor Agent fails to generate diffs
 * 
 * @example
 * ```typescript
 * const result = await runExecution({
 *   jsonPlanContent: fs.readFileSync('plans/task-123.json', 'utf8'),
 *   projectDocsContext: buildProjectContext()
 * });
 * 
 * console.log(`Execution ${result.id} completed`);
 * console.log(`Diffs saved to: ${result.savedDiffsPath}`);
 * 
 * // Example output:
 * // {
 * //   id: '1702512345678',
 * //   savedDiffsPath: '/path/to/project/executions/1702512345678',
 * //   output: {
 * //     summary: 'Updated login component with new validation logic',
 * //     modifications: [
 * //       {
 * //         path: 'src/components/Login.tsx',
 * //         diff: '--- a/src/components/Login.tsx\n+++ b/src/components/Login.tsx\n...'
 * //       }
 * //     ],
 * //     missingInformation: [],
 * //     confidence: 0.95
 * //   }
 * // }
 * ```
 */
export async function runExecution(
    { jsonPlanContent, projectDocsContext }: ExecutionParams
): Promise<ExecutionResult> {
    const planner = parsePlannerOutput(jsonPlanContent);

    const filesToModify = planner.implementation?.filesToModify ?? [];

    if (!filesToModify[0]) {
        throw new Error(
            "Planner did not provide implementation.filesToModify. Cannot run execution."
        );
    }

    console.log("Files to modify:", filesToModify);

    const loadedFiles = await loadRepoFiles(filesToModify);

    console.log("Loaded files:", loadedFiles);
    const { id, folder } = createExecutionFolder();

    console.log("Execution ID:", id);
    console.log("Execution folder:", folder);

    const executorOutput = await runExecutorAgent({
        planJson: jsonPlanContent,
        projectDocs: projectDocsContext,
        files: loadedFiles,
    });

    const diffPaths: string[] = [];

    for (const mod of executorOutput.modifications) {
        const p = saveDiffFile(folder, mod.path, mod.diff);
        diffPaths.push(p);
    }

    saveExecutionManifest(folder, {
        plan: jsonPlanContent,
        projectDocsContext,
        filesLoaded: filesToModify,
        executorOutput,
        diffPaths,
    });

    return {
        id,
        output: executorOutput,
        savedDiffsPath: folder,
    };
}
