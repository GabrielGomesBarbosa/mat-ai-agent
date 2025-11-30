import fs from "fs/promises";
import path from "path";

/**
 * Saves a prompt string to a markdown file for debugging purposes.
 * 
 * @param prompt - The prompt content to save
 * @param fileName - The name of the file (without extension)
 */
export async function saveDebugPrompt(prompt: string, fileName: string): Promise<void> {
    const debugDir = path.join(process.cwd(), "debug", "prompts");

    try {
        const fileDir = path.dirname(fileName);
        const targetDir = path.join(debugDir, fileDir);

        await fs.mkdir(targetDir, { recursive: true });

        const baseName = path.basename(fileName);
        const filePath = path.join(targetDir, `${baseName}.md`);

        await fs.writeFile(filePath, prompt, "utf8");

        console.log(`[Debug] Prompt saved to: ${filePath}`);
    } catch (error) {
        console.error(`[Debug] Failed to save prompt to ${fileName}:`, error);
    }
}
