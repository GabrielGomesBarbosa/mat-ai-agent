import OpenAI from "openai";
import { env } from "@/config/env";

const openAiClient = new OpenAI({ apiKey: env.openaiApiKey });

export default openAiClient;