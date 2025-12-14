import fs from "node:fs";
import path from "node:path";

type CreateExecutionFolderResult = {
    id: string;
    folder: string;
}

/**
 * Creates a new unique execution folder based on the current timestamp.
 * 
 * @returns An object containing the generated execution ID and the absolute path to the folder.
 * 
 * @example
 * const { id, folder } = createExecutionFolder();
 * console.log(id); // "1765692907016"
 * console.log(folder); // "/path/to/project/executions/1765692907016"
 */
export function createExecutionFolder(): CreateExecutionFolderResult {
    const id = Date.now().toString();
    const folder = path.join(process.cwd(), "executions", id);
    fs.mkdirSync(folder, { recursive: true });
    return { id, folder };
}
