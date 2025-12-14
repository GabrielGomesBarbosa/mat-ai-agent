/**
 * Represents a single file in the repository index.
 * Stores metadata used for retrieval and analysis.
 */
export type RepoFileEntry = {
    /** Relative path from repo root (normalized to forward slashes) */
    path: string;
    /** Classified type of the file (e.g., 'component', 'hook', 'utility') */
    type:
    | "component"
    | "page"
    | "module-component"
    | "module-page"
    | "module-hook"
    | "module-utility"
    | "module-type"
    | "module-context"
    | "module-constant"
    | "hook"
    | "context"
    | "utility"
    | "shared-component"
    | "shared-constant"
    | "shared-hook"
    | "shared-utility"
    | "shared-type"
    | "shared-context"
    | "asset"
    | "constant"
    | "translation"
    | "route"
    | "util"
    | "workflow"
    | "test"
    | "type"
    | "config"
    | "unknown";
    /** Size of the file in bytes */
    size: number;
    /** Name of the primary component exported, if any (e.g. "Header") */
    componentName?: string;
    /** Last modified timestamp (ms) */
    lastModified?: number;
    /** List of modules or symbols imported by this file */
    imports?: string[]
    /** List of symbols exported by this file */
    exports?: string[]
    /** Top-level symbols defined in the file (functions, classes, consts) */
    symbols?: string[]
};

export type RepoIndex = {
    generatedAt: string;
    root: string;
    files: RepoFileEntry[];
};
