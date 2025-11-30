import "dotenv/config";

export const env = {
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    mondayApiKey: process.env.MONDAY_API_KEY ?? "",
    frontendRepoPath: process.env.FRONTEND_REPO_PATH ?? "",
};

if (!env.openaiApiKey) throw new Error("Missing OPENAI_API_KEY");
if (!env.mondayApiKey) throw new Error("Missing MONDAY_API_KEY");
if (!env.frontendRepoPath) throw new Error("Missing FRONTEND_REPO_PATH");
