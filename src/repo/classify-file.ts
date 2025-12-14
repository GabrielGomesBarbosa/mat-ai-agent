import type { RepoFileEntry } from "@/types/repo-index";

/**
 * Classifies a file into a specific type based on its path structure.
 * This function uses a series of heuristic checks on the file path string
 * to determine if a file is a component, hook, utility, config, etc.
 *
 * The order of checks is important (e.g., checking specific "shared" modules before generic ones).
 *
 * @param filePath - The relative path of the file to classify (e.g., "src/components/Header.tsx")
 * @returns The specific `RepoFileEntry['type']` enum value (e.g., "component", "hook", "config")
 *
 * @example
 * classifyFile("src/modules/shared/components/Button.tsx"); // "shared-component"
 * classifyFile("src/utils/date.ts"); // "utility"
 */
export function classifyFile(filePath: string): RepoFileEntry["type"] {
    const p = filePath.toLowerCase();

    if (p.includes("/modules/shared/components/")) return "shared-component";
    if (p.includes("/modules/shared/constants/")) return "shared-constant";
    if (p.includes("/modules/shared/hooks/")) return "shared-hook";
    if (p.includes("/modules/shared/utils/")) return "shared-utility";
    if (p.includes("/modules/shared/types/")) return "shared-type";
    if (p.includes("/modules/shared/contexts/")) return "shared-context";

    if (p.includes("/modules/") && p.includes("/components/")) return "module-component";
    if (p.includes("/modules/") && p.includes("/pages/")) return "module-page";
    if (p.includes("/modules/") && p.includes("/hooks/")) return "module-hook";
    if (p.includes("/modules/") && p.includes("/utils/")) return "module-utility";
    if (p.includes("/modules/") && (p.includes("-types.ts") || p.includes("/types"))) return "module-type";
    if (p.includes("/modules/") && p.includes("/contexts/")) return "module-context";
    if (p.includes("/modules/") && p.includes("/constants")) return "module-constant";

    if (p.includes("/assets/")) return "asset";
    if (p.includes("/components/")) return "component";
    if (p.includes("/constants/")) return "constant";
    if (p.includes("/contexts/")) return "context";
    if (p.includes("/hooks/")) return "hook";
    if (p.includes("/i18n/")) return "translation";
    if (p.includes("/routes/")) return "route";
    if (p.includes("/utils/")) return "utility";
    if (p.includes("/type/") || p.includes(".d.ts")) return "type";
    if (p.includes("/workflows/")) return "workflow";
    if (p.includes("cypress/") || p.includes("coverage/")) return "test";

    if (p.includes("app.tsx") || p.includes("app-theme.tsx") || p.includes("src/index.ts")) return "component";

    if (p.includes("eslint")
        || p.includes("gitignore")
        || p.includes("npmrc")
        || p.includes("prettier")
        || p.includes("yarnrc")
        || p.includes("CLAUDE")
        || p.includes("CODEOWNERS")
        || p.includes(".config")
        || p.includes("tsconfig")
        || p.includes("setupTests")
        || p.includes("instrument")
    ) return "config";

    return "unknown";
}
