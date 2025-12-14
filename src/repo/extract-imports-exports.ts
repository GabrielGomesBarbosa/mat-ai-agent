/**
 * Analyzes source code to extract imported and exported symbols using regex.
 *
 * This function provides a lightweight static analysis to understand dependencies
 * and public interfaces of a file without running a full AST parser.
 *
 * ⚠️ Heuristic-based by design:
 * - Fast
 * - Safe
 * - No execution
 * - No full AST cost
 *
 * @param source - The raw string content of the source file.
 * @returns An object containing arrays of unique imported and exported symbol names.
 */
export function extractImportsAndExports(source: string): {
    imports: string[]
    exports: string[]
} {
    const imports = new Set<string>()
    const exports = new Set<string>()

    const importRegex = /import\s+(?:type\s+)?(?:\{([^}]+)\}|([a-zA-Z0-9_]+))\s+from/g
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|type|interface)?\s*([a-zA-Z0-9_]+)/g

    let match: RegExpExecArray | null

    while ((match = importRegex.exec(source))) {
        const named = match[1]
        const single = match[2]

        if (named) {
            named
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
                .map((i) =>
                    i.includes(" as ")
                        ? i.split(" as ")[1].trim()
                        : i
                )
                .forEach((i) => imports.add(i))
        }

        if (single) {
            const cleaned = single.trim()
            if (cleaned) {
                imports.add(cleaned)
            }
        }
    }

    while ((match = exportRegex.exec(source))) {
        const name = match[1]?.trim()
        if (name) {
            exports.add(name)
        }
    }

    return {
        imports: [...imports],
        exports: [...exports],
    }
}