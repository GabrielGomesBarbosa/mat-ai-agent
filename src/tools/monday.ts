import axios from "axios";
import { env } from "@/config/env";
import mondayClient from "@/services/mondayClient";
import { extractBlockContents } from "@/utils/content-parser";
import { DocumentBlock } from "@/types/monday-types";

export type MondayTask = {
  id: string;
  name: string;
  description: {
    id: string
    blocks: DocumentBlock[]
  };
};

type MondayTaskResponse = {
  id: string;
  name: string;
  description: string
};

export async function getMondayTaskById(taskId: string): Promise<MondayTaskResponse> {
  const query = `
    query ($ids: [ID!]) {
      items (ids: $ids) {
        id
        name
        description {
          id
          blocks {
            id
            doc_id
            content
          }
        }
      }
    }
    `;

  const variables = { ids: [taskId] };

  const response = await mondayClient.request<{ items: MondayTask[] }>(query, variables);

  const item = response.items?.[0];

  if (!item) throw new Error(`Monday item not found: ${taskId}`);

  const description = extractBlockContents(item.description?.blocks);

  return {
    id: item.id,
    name: item.name,
    description,
  };
}
