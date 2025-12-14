import { ExecutorOutput } from "@/types/executor-output";

export type ExecutionParams = {
    /**
     * Full planner JSON string returned by Phase 1.
     * It should contain implementation.filesToModify inside.
     */
    jsonPlanContent: string;

    /**
     * Text with your project context: AGENT.md + other docs from /context.
     * You can concatenate them into one big string before calling runExecution.
     */
    projectDocsContext: string;
};

export type ExecutionResult = {
    id: string;
    output: ExecutorOutput;
    savedDiffsPath: string;
};
