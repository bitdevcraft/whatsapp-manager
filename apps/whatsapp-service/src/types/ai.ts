export enum GeminiAiConversationRoleEnum {
  Ai = "assistant",
  Model = "model",
  User = "user",
}

export enum OpenAiConversationRoleEnum {
  Ai = "assistant",
  User = "user",
}

export interface ConversationGeminiMessageType {
  parts: { text: string }[];
  role: GeminiAiConversationRoleEnum;
}

export interface ConversationMessageType {
  content: string;
  parts: { text: string }[];
  role: OpenAiConversationRoleEnum;
}
