export function buildPlannerPrompt(args: {
    projectDocs: string;
    taskId: string;
    taskTitle: string;
    taskDescription: string;
}) {
    return `
You are a Senior Frontend Architect AI.

Generate a structured IMPLEMENTATION PLAN as valid JSON.
Follow the PlannerOutput schema strictly.

GUIDELINES:
- Do not write code.
- Do not modify files.
- Be concise & deterministic.
- If unsure, add entries under "missingInformation".
- Use project docs exactly as provided.

PROJECT CONTEXT:
${args.projectDocs || "(none provided)"}

TASK ID: ${args.taskId}
TITLE: ${args.taskTitle}
DESCRIPTION:
${args.taskDescription}

Return ONLY a JSON object.
`;
}
