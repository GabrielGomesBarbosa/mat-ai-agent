import "dotenv/config";

export const env = {
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    mondayToken: process.env.MONDAY_API_TOKEN ?? "",
    mondayUrl: process.env.MONDAY_API_URL ?? "https://api.monday.com/v2"
};

if (!env.openaiApiKey) throw new Error("Missing OPENAI_API_KEY");
if (!env.mondayToken) throw new Error("Missing MONDAY_API_TOKEN");
