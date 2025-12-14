import { createTwoFilesPatch } from "diff";

/**
 * Detects whether a file uses tabs or spaces for indentation.
 * 
 * @param content - The full content of the file to analyze.
 * @returns An object containing `useTabs` (boolean) and the detected `tabSize` (number).
 */
function detectIndentation(content: string): { useTabs: boolean; tabSize: number } {
    const lines = content.split('\n');
    let tabCount = 0;
    let spaceCount = 0;

    for (const line of lines.slice(0, 100)) {
        if (line.startsWith('\t')) tabCount++;
        if (line.match(/^ {2,}/)) spaceCount++;
    }

    // Detect tab size
    let tabSize = 2;
    const spaceMatches = content.match(/^ +/gm);
    if (spaceMatches) {
        const spaceCounts = spaceMatches.map(m => m.length);
        const gcd = spaceCounts.reduce((a, b) => {
            while (b) { const t = b; b = a % b; a = t; }
            return a;
        });
        if (gcd >= 2 && gcd <= 8) tabSize = gcd;
    }

    return { useTabs: tabCount > spaceCount, tabSize };
}

/**
 * Converts leading spaces in diff lines to tabs, based on the specified tab size.
 * Ensures that the patch respects the project's original indentation style if it uses tabs.
 * 
 * @param diff - The unified diff string.
 * @param tabSize - The number of spaces that represent one tab (e.g., 2 or 4).
 * @returns The diff string with corrected indentation.
 */
function convertSpacesToTabs(diff: string, tabSize: number): string {
    const lines = diff.split('\n');

    return lines.map(line => {
        // Skip headers and hunk markers
        if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
            return line;
        }

        // Process content lines (space/+/- prefix)
        if (line.length > 0 && (line[0] === ' ' || line[0] === '+' || line[0] === '-')) {
            const marker = line[0];
            const content = line.substring(1);


            // Convert leading spaces to tabs
            let leadingSpaces = 0;
            for (const char of content) {
                if (char === ' ') leadingSpaces++;
                else break;
            }

            if (leadingSpaces >= tabSize) {
                const tabs = '\t'.repeat(Math.floor(leadingSpaces / tabSize));
                const remainingSpaces = ' '.repeat(leadingSpaces % tabSize);
                const rest = content.substring(leadingSpaces);
                return marker + tabs + remainingSpaces + rest;
            }
        }

        return line;
    }).join('\n');
}

/**
 * Parses a malformed diff to extract the "old" and "new" file content.
 * Used when regenerating a full-file diff into proper hunks.
 * 
 * @param diff - The malformed diff string (potentially a full-file replacement).
 * @returns An object containing the reconstructed `oldContent` and `newContent`.
 */
function extractContentFromDiff(diff: string): { oldContent: string; newContent: string } {
    const lines = diff.split('\n');
    const oldLines: string[] = [];
    const newLines: string[] = [];

    for (const line of lines) {
        // Skip headers
        if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
            continue;
        }

        if (line.startsWith('-')) {
            // Removed line (in old file)
            oldLines.push(line.substring(1));
        } else if (line.startsWith('+')) {
            // Added line (in new file)
            newLines.push(line.substring(1));
        } else if (line.startsWith(' ')) {
            // Context line (in both files)
            const content = line.substring(1);
            oldLines.push(content);
            newLines.push(content);
        }
    }

    return {
        oldContent: oldLines.join('\n'),
        newContent: newLines.join('\n')
    };
}

/**
 * Heuristically detects if an AI-generated diff is actually a full-file replacement
 * (a single large hunk covering most of the file) rather than targeted changes.
 * 
 * @param diff - The unified diff string.
 * @param originalContent - The original content of the file.
 * @returns `true` if it looks like a full-file diff, `false` otherwise.
 */
function isFullFileDiff(diff: string, originalContent: string): boolean {
    const lines = diff.split('\n');

    // Count hunks
    const hunkCount = lines.filter(l => l.startsWith('@@')).length;

    // If there's only one hunk, check if it's suspiciously large
    if (hunkCount === 1) {
        const contentLines = lines.filter(l =>
            l.startsWith(' ') || l.startsWith('+') || l.startsWith('-')
        );

        const originalLineCount = originalContent.split('\n').length;

        // If the hunk has more than 70% of the original file's lines, it's likely a full-file diff
        if (contentLines.length > originalLineCount * 0.7) {
            return true;
        }
    }

    return false;
}

/**
 * Corrects common issues in AI-generated unified diffs to make them applicable.
 * 
 * The function performs three main fixes:
 * 1. **Full-File Regeneration**: If the AI basically rewrote the whole file as one change,
 *    it regenerates the diff using `createTwoFilesPatch` to create proper contextual hunks.
 * 2. **Whitespace Normalization**: Converts spaces to tabs if the original file uses tabs.
 * 3. **Header Correction**: Recalculates the line counts in `@@ -old,count +new,count @@` headers
 *    to match the actual lines in the hunk.
 * 
 * @param diff - The raw, potentially malformed diff from the AI.
 * @param originalContent - The original content of the target file.
 * @returns A cleaned, valid unified diff string.
 */
export function normalizeDiff(diff: string, originalContent: string): string {
    if (isFullFileDiff(diff, originalContent)) {
        console.log("⚠️  Detected full-file diff, regenerating with proper hunks...");

        const { oldContent, newContent } = extractContentFromDiff(diff);

        const properDiff = createTwoFilesPatch(
            'a/file',
            'b/file',
            oldContent,
            newContent,
            '',
            '',
            { context: 3 }
        );

        const properDiffLines = properDiff.split('\n');
        const withoutHeaders = properDiffLines.filter(l =>
            !l.startsWith('---') && !l.startsWith('+++')
        ).join('\n');

        console.log("✓ Regenerated diff with proper hunks");

        diff = withoutHeaders;
    }

    const { useTabs, tabSize } = detectIndentation(originalContent);

    let fixedDiff = useTabs ? convertSpacesToTabs(diff, tabSize) : diff;

    const lines = fixedDiff.split('\n');
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('---') || line.startsWith('+++')) {
            result.push(line);
            i++;
            continue;
        }

        if (line.startsWith('@@')) {
            const hunkHeaderMatch = line.match(/@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
            if (!hunkHeaderMatch) {
                result.push(line);
                i++;
                continue;
            }

            const oldStart = parseInt(hunkHeaderMatch[1]);
            const newStart = parseInt(hunkHeaderMatch[3]);

            const hunkLines: string[] = [];
            i++;

            while (i < lines.length && !lines[i].startsWith('@@')) {
                const contentLine = lines[i];
                if (contentLine.startsWith(' ') || contentLine.startsWith('+') || contentLine.startsWith('-')) {
                    hunkLines.push(contentLine);
                } else if (contentLine === '') {
                    hunkLines.push(' ');
                } else {
                    break;
                }
                i++;
            }

            let oldCount = 0;
            let newCount = 0;

            for (const hunkLine of hunkLines) {
                if (hunkLine[0] === ' ') {
                    oldCount++;
                    newCount++;
                } else if (hunkLine[0] === '-') {
                    oldCount++;
                } else if (hunkLine[0] === '+') {
                    newCount++;
                }
            }

            const correctedHeader = `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`;
            result.push(correctedHeader);
            result.push(...hunkLines);

            continue;
        }

        result.push(line);
        i++;
    }

    return result.join('\n');
}
