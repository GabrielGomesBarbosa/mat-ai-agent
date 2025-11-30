import { loadProjectDocs } from "@/tools/docs";
import { getMondayTaskById } from "@/tools/monday";
import openAiClient from "@/services/openAIClient";
import { saveDebugPrompt } from "@/utils/debug-prompt";
import type { PlannerOutput } from "@/types/plannerTypes";
import { buildPlannerPrompt } from "@/prompts/plannerPrompt";
import { plannerOutputJsonSchema } from "@/schemas/planner-output-schema";

const model = "gpt-4.1-mini";

export async function runPlannerAgent(taskId: string): Promise<PlannerOutput> {
    const [projectDocs, task] = await Promise.all([
        loadProjectDocs(),
        getMondayTaskById(taskId),
    ]);

    const prompt = buildPlannerPrompt({
        projectDocs,
        taskId,
        taskName: task.name,
        taskDescription: task.description,
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
}
