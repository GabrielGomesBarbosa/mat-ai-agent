export type RepoFileEntry = {
    path: string;
    type:
    | "component"
    | "page"
    | "module-component"
    | "module-page"
    | "hook"
    | "context"
    | "utility"
    | "shared-component"
    | "unknown";
    size: number;
    componentName?: string;
    lastModified?: number;
};

export type RepoIndex = {
    generatedAt: string;
    root: string;
    files: RepoFileEntry[];
};
