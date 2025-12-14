/**
 * Converts a file path to POSIX style (forward slashes).
 * Useful for ensuring consistent path comparisons across different operating systems (Windows vs macOS/Linux).
 *
 * @param p - The file path to normalize
 * @returns The path with all backslashes replaced by forward slashes
 *
 * @example
 * toPosixPath("C:\\Users\\Name\\file.txt") // returns "C:/Users/Name/file.txt"
 * toPosixPath("src\\utils\\helper.ts")     // returns "src/utils/helper.ts"
 */
export default function toPosixPath(p: string): string {
    return p.replace(/\\/g, "/");
}