import type { PlannerOutput } from "@/types/plannerTypes";

/**
 * Parses the raw JSON string from the Planner Agent into a structured PlannerOutput object.
 * 
 * @param jsonPlanContent - The raw JSON string containing the plan.
 * @returns The parsed `PlannerOutput` object.
 * @throws Error if the JSON is invalid or cannot be parsed.
 * 
 * @example
 * ```ts
 * const rawJson = '{"task": { "id": "123", ... }, "implementation": { ... }}'
 * const plan = parsePlannerOutput(rawJson)
 * console.log(plan.implementation.filesToModify)
 * ```
 */
export function parsePlannerOutput(jsonPlanContent: string): PlannerOutput {
    try {
        return JSON.parse(jsonPlanContent) as PlannerOutput
    } catch (err) {
        throw new Error("Invalid planner JSON passed to execution: Failed to parse string content.")
    }
}
