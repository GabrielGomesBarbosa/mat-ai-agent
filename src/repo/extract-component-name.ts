/**
 * Extracts specific React component name from file content.
 * It uses simple regex heuristics to find:
 * 1. `export (default) function ComponentName`
 * 2. `export const ComponentName = (`
 *
 * This is used to populate the `componentName` field in repo-index.json.
 *
 * @param content - The raw string content of a code file
 * @returns The component name if found, or undefined
 *
 * @example
 * extractComponentName("export default function Header() {}"); // "Header"
 * extractComponentName("export const Footer = () => {}"); // "Footer"
 */
export function extractComponentName(content: string): string | undefined {
    const fn = content.match(
        /export\s+(default\s+)?function\s+([A-Z][A-Za-z0-9_]*)/
    );

    if (fn) return fn[2];

    const constMatch = content.match(
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(/
    );

    if (constMatch) return constMatch[1];

    return undefined;
}
