export enum OpenAiConversationRoleEnum {
  User = "user",
  Ai = "assistant",
}

export enum GeminiAiConversationRoleEnum {
  User = "user",
  Ai = "assistant",
  Model = "model",
}

export type ConversationMessageType = {
  role: OpenAiConversationRoleEnum;
  content: string;
  parts: { text: string }[];
};

export type ConversationGeminiMessageType = {
  role: GeminiAiConversationRoleEnum;
  parts: { text: string }[];
};
