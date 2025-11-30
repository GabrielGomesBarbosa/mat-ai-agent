export function extractComponentName(content: string): string | undefined {
    // function Component() {} or export default function Component()
    const fn = content.match(
        /export\s+(default\s+)?function\s+([A-Z][A-Za-z0-9_]*)/
    );
    if (fn) return fn[2];

    // const Component = () => {}
    const constMatch = content.match(
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(/
    );
    if (constMatch) return constMatch[1];

    return undefined;
}
