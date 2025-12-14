export default function buildPlannerPrompt(args: {
    projectDocs: string;
    taskId: string;
    taskName: string;
    taskDescription: string;
}) {
    return `
You are a Senior Frontend Architect AI.

Your task is to generate a COMPLETE IMPLEMENTATION PLAN based on the task description and project documentation.

The output MUST match the JSON schema provided by the system. 
Do NOT add or remove fields. 
Do NOT return text outside of JSON. 
Do NOT wrap the JSON in markdown.

PROJECT CONTEXT:
${args.projectDocs || "(none provided)"}

TASK ID: ${args.taskId}
TASK NAME: ${args.taskName}
TASK DESCRIPTION:
${args.taskDescription}

Return ONLY a JSON object.
`;
}
