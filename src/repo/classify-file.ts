import type { RepoFileEntry } from "@/types/repo-index";

export function classifyFile(filePath: string): RepoFileEntry["type"] {
    const p = filePath.toLowerCase();

    if (p.includes("/components/")) return "component";
    if (p.includes("/contexts/")) return "context";
    if (p.includes("/utils/")) return "utility";

    if (p.includes("/modules/shared/components/")) return "shared-component";
    if (p.includes("/modules/") && p.includes("/components/"))
        return "module-component";
    if (p.includes("/modules/") && p.includes("/pages/")) return "module-page";

    if (p.includes("/hooks/")) return "hook";
    if (p.includes("/pages/")) return "page";

    return "unknown";
}
