import { OpenAI } from "openai";

import {
  type ConversationMessageType,
  OpenAiConversationRoleEnum,
} from "../types";
import {
  cacheData,
  computeCacheKey,
  getCachedData,
  getConversationContextCacheKey,
} from "./cache";

const openAiApiKey = process.env.OPEN_AI_API_KEY;
const organizationId = process.env.OPEN_AI_ORG_ID;
const projectId = process.env.OPEN_AI_PROJECT_ID;

if (!openAiApiKey || !organizationId || !projectId) {
  throw new Error("OPEN_AI_API_KEY not defined!");
}

const OpenApiClient = new OpenAI({
  apiKey: openAiApiKey,
  organization: organizationId,
  project: projectId,
});

export async function askAi(
  message: string,
  fromPhoneNumber: string
): Promise<string> {
  try {
    const contextCacheKey = getConversationContextCacheKey(fromPhoneNumber);
    const context =
      await getCachedData<ConversationMessageType[]>(contextCacheKey);

    let response = "Sorry, I am not able to understand that.";
    const responseCacheKey = computeCacheKey({
      context: "response_cache",
      id: message.trim(),
    });
    const cachedResponse = await getCachedData<string>(responseCacheKey);
    if (cachedResponse) {
      response = cachedResponse;
    } else {
      const chatCompletion = await OpenApiClient.chat.completions.create({
        messages: [
          {
            content: `You are an intelligent assistant helping a user with their queries. You can provide information, answer questions, and help the user complete tasks. 
You are required to give very to the point and very clear answers to the user queries.
Also, you can reveal your identity, ack like a human, and provide information about the product.
Never ever accept that you are an AI or a chatbot or an intelligent assistant.`,
            role: "system",
          },
          ...(context ?? []),
          {
            role: "user",
            content: message,
          },
        ],
        model: "gpt-4o",
      });

      const aiResponse = chatCompletion.choices[0]?.message.content;
      if (aiResponse) response = aiResponse;
    }

    await cacheData({
      data: [
        ...(context ?? []),
        {
          content: message,
          role: OpenAiConversationRoleEnum.User,
        },
        {
          content: response,
          role: OpenAiConversationRoleEnum.Ai,
        },
      ],
      key: contextCacheKey,
    });
    return response;
  } catch (error) {
    console.error(error);
    return "Sorry, I am not able to understand that.";
  }
}
