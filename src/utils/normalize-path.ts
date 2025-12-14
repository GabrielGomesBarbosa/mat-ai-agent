/**
 * Normalizes a file path to use POSIX-style forward slashes.
 * This ensures consistent path handling across different operating systems (e.g., Windows vs macOS/Linux).
 *
 * @param p - The file path to normalize.
 * @returns The normalized path with forward slashes.
 *
 * @example
 * normalizePath("src\\utils\\file.ts") // Returns "src/utils/file.ts"
 * normalizePath("src/utils/file.ts")   // Returns "src/utils/file.ts"
 */
export default function normalizePath(p: string) {
    return p.replace(/\\/g, "/");
}
