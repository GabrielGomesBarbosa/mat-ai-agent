export type FileModification = {
    /** The relative path of the file to modify (must match a path in repo-index.json). */
    path: string;
    /** The unified diff string containing the changes for this file. */
    diff: string;
};

export type ExecutorOutput = {
    /** A high-level description of what changes were actually generated. */
    summary: string;
    /** List of all file modifications (diffs) produced by the agent. */
    modifications: FileModification[];
    /** Any information the agent felt was missing to complete the task perfectly. */
    missingInformation: string[];
    /** Confidence score (0-1) indicating how certain the agent is about the correctness of the changes. */
    confidence: number;
};
