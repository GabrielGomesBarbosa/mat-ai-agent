/**
 * Cleans a JSON string by escaping control characters (newlines, tabs, etc.) 
 * that might strictly be invalid in JSON strings but often appear in LLM output.
 * 
 * @param jsonString - The raw JSON string to clean.
 * @returns The cleaned JSON string with control characters escaped.
 */
function cleanJsonString(jsonString: string): string {
    const result: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (inString) {
            if (char === '\\') {
                result.push(char);
                escaped = !escaped;
                continue;
            }

            if (!escaped && char === '"') {
                inString = false;
                result.push(char);
                continue;
            }

            if (char === '\n') {
                result.push('\\n');
            } else if (char === '\r') {
                result.push('\\r');
            } else if (char === '\t') {
                result.push('\\t');
            } else {
                result.push(char);
            }

            if (escaped) escaped = false;

        } else {
            if (char === '"') {
                inString = true;
                escaped = false;
            }
            result.push(char);
        }
    }
    return result.join('');
}

/**
 * Safely parses a string that should contain JSON, even if it's wrapped in Markdown code blocks
 * or contains invalid control characters.
 * 
 * 1. Extracts content from ```json ... ``` blocks if present.
 * 2. Cleans the string using `cleanJsonString` to handle control chars.
 * 3. parses the result using `JSON.parse`.
 * 
 * @param content - The raw string content from an LLM response.
 * @returns The parsed object of type T.
 * @throws Error if JSON parsing fails.
 */
export function parseJsonSafe<T>(content: string): T {
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = content.match(codeBlockRegex);
    let jsonStr = match ? match[1] : content;

    jsonStr = cleanJsonString(jsonStr);

    return JSON.parse(jsonStr);
}
