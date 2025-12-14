import fs from "node:fs";
import path from "node:path";

import { getMondayTaskById } from "@/tools/monday";
import openAiClient from "@/services/openAIClient";
import { saveDebugPrompt } from "@/utils/debug-prompt";
import type { PlannerOutput } from "@/types/plannerTypes";
import buildPlannerPrompt from "@/prompts/build-planner-prompt";
import { plannerOutputJsonSchema } from "@/schemas/planner-output-schema";

const model = "gpt-4.1-mini";

/**
 * Loads the project context from the generated markdown file.
 * 
 * @returns {string} The content of the project context file.
 * @throws {Error} If the project context file does not exist.
 */
function loadProjectContext(): string {
    const contextPath = path.resolve(process.cwd(), "generated/memory/project-context.md");

    if (!fs.existsSync(contextPath)) {
        throw new Error(`Project context not found at: ${contextPath}. Please run 'npm run build:project-context' first.`);
    }

    return fs.readFileSync(contextPath, "utf-8");
}

/**
 * Runs the Planner Agent to generate an implementation plan for a given task.
 * 
 * This agent performs the following steps:
 * 1. Loads the project context.
 * 2. Fetches the task details from Monday.com.
 * 3. Builds a prompt combining context and task info.
 * 4. Queries OpenAI to generate a structured implementation plan.
 * 
 * @param {string} taskId - The ID of the task on Monday.com.
 * @returns {Promise<PlannerOutput>} A promise that resolves to the generated plan in JSON format.
 * @throws {Error} If any step of the process fails.
 */
export default async function plannerAgent(taskId: string): Promise<PlannerOutput> {
    try {
        const projectDocContext = loadProjectContext();

        const mondayTask = await getMondayTaskById(taskId);

        const prompt = buildPlannerPrompt({
            projectDocs: projectDocContext,
            taskId,
            taskName: mondayTask.name,
            taskDescription: mondayTask.description,
        });

        saveDebugPrompt(prompt, `planner/${taskId}`);

        const completion = await openAiClient.chat.completions.create({
            model,
            messages: [
                { role: "system", content: "You output JSON only." },
                { role: "user", content: prompt },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: 'PlannerOutput',
                    schema: plannerOutputJsonSchema,
                    strict: true,
                }
            },
        });

        return JSON.parse(completion.choices[0].message.content ?? "{}");
    } catch (error) {
        console.error("Error in plannerAgent:", error);
        throw error;
    }
}
