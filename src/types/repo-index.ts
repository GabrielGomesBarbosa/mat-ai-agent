export type RepoFileEntry = {
    path: string;
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
    size: number;
    componentName?: string;
    lastModified?: number;
};

export type RepoIndex = {
    generatedAt: string;
    root: string;
    files: RepoFileEntry[];
};
