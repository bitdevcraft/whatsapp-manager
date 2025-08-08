import { GoogleGenAI } from "@google/genai";

import {
  type ConversationGeminiMessageType,
  GeminiAiConversationRoleEnum,
} from "../types";
import {
  cacheData,
  computeCacheKey,
  getCachedData,
  getConversationContextCacheKey,
} from "./cache";

const geminiAiApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!geminiAiApiKey) {
  throw new Error("GEMINI_AI_API_KEY not defined!");
}

const ai = new GoogleGenAI({ apiKey: geminiAiApiKey });

export async function askAi(
  message: string,
  fromPhoneNumber: string
): Promise<string> {
  try {
    const contextCacheKey = getConversationContextCacheKey(fromPhoneNumber);
    const context =
      await getCachedData<ConversationGeminiMessageType[]>(contextCacheKey);

    let response = "Sorry, I am not able to understand that.";
    const responseCacheKey = computeCacheKey({
      context: "response_cache",
      id: message.trim(),
    });
    const cachedResponse = await getCachedData<string>(responseCacheKey);
    if (cachedResponse) {
      response = cachedResponse;
    } else {
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [...(context ? context : [])],
      });

      const aiResponse = await chat.sendMessage({
        config: {
          systemInstruction: [
            "You are an intelligent assistant helping a user with their queries. You can provide information, answer questions, and help the user complete tasks.",
            "You are required to give very to the point and very clear answers to the user queries.",
            "Also, you can reveal your identity, ack like a human, and provide information about the product.",
            "Never ever accept that you are an AI or a chatbot or an intelligent assistant.",
          ],
        },
        message: message,
      });

      if (aiResponse.text) response = aiResponse.text;
    }

    await cacheData({
      data: [
        ...(context ?? []),
        {
          parts: [{ text: message }],
          role: GeminiAiConversationRoleEnum.User,
        },
        {
          parts: [{ text: response }],
          role: GeminiAiConversationRoleEnum.Model,
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
