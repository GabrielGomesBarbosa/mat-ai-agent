import axios from "axios";
import { env } from "@/config/env";

export type MondayTask = {
  id: string;
  title: string;
  description: string;
};

export async function getMondayTaskById(taskId: string): Promise<MondayTask> {
  const query = `
    query ($ids: [ID!]) {
      items (ids: $ids) {
        id
        name
        column_values {
          id
          text
        }
      }
    }
    `;

  const variables = { ids: [taskId] };

  const res = await axios.post(
    env.mondayUrl,
    { query, variables },
    {
      headers: {
        Authorization: env.mondayToken,
        "Content-Type": "application/json",
      },
    }
  );

  const item = res.data?.data?.items?.[0];

  if (!item) throw new Error(`Monday item not found: ${taskId}`);

  const descCol =
    item.column_values?.find((c: any) => c.id === "description") ??
    item.column_values?.[0];

  return {
    id: String(item.id),
    title: item.name ?? "",
    description: descCol?.text ?? "",
  };
}
