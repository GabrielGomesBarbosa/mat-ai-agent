import OpenAI from "openai";
import { env } from "@/config/env";
import { loadProjectDocs } from "@/tools/docs";
import { getMondayTaskById } from "@/tools/monday";
import { buildPlannerPrompt } from "@/prompts/plannerPrompt";
import type { PlannerOutput } from "@/types/plannerTypes";

const client = new OpenAI({ apiKey: env.openaiApiKey });

export async function runPlannerAgent(taskId: string): Promise<PlannerOutput> {
    const [projectDocs, task] = await Promise.all([
        loadProjectDocs(),
        getMondayTaskById(taskId),
    ]);

    const prompt = buildPlannerPrompt({
        projectDocs,
        taskId,
        taskTitle: task.title,
        taskDescription: task.description,
    });

    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You output JSON only." },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content ?? "{}");
}
