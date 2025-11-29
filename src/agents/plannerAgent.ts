import OpenAI from "openai";
import { env } from "@/config/env";
import { loadProjectDocs } from "@/tools/docs";
import { getMondayTaskById } from "@/tools/monday";
import type { PlannerOutput } from "@/types/plannerTypes";
import { buildPlannerPrompt } from "@/prompts/plannerPrompt";

export async function runPlannerAgent(taskId: string): Promise<PlannerOutput> {
    const [projectDocs, task] = await Promise.all([
        loadProjectDocs(),
        getMondayTaskById(taskId),
    ]);

    // console.log(projectDocs);
    // console.log(task);

    const prompt = buildPlannerPrompt({
        projectDocs,
        taskId,
        taskName: task.name,
        taskDescription: task.description,
    });

    // const completion = await client.chat.completions.create({
    //     model: "gpt-4o",
    //     messages: [
    //         { role: "system", content: "You output JSON only." },
    //         { role: "user", content: prompt },
    //     ],
    //     response_format: { type: "json_object" },
    // });

    // return JSON.parse(completion.choices[0].message.content ?? "{}");

    return {} as any
}
