import type OpenAI from "openai";

export type UIContext = {
  activeListId?: string;
  activeListName?: string;
};

export type ChatInput = {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  context?: UIContext;
};
