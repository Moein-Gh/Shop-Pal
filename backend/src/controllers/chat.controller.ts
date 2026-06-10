import type { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import { prisma } from "../libs/prisma.js";
import type { ChatInput } from "../types/chat.js";

const openai = new OpenAI();

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_lists",
      description: "Get all shopping lists the user has access to.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_items",
      description: "Get all items in a specific list.",
      parameters: {
        type: "object",
        properties: {
          list_id: { type: "string", description: "The ID of the list." },
        },
        required: ["list_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_item",
      description: "Add one or more items to a list.",
      parameters: {
        type: "object",
        properties: {
          list_id: { type: "string", description: "The ID of the list." },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: {
                  type: "string",
                  description: "e.g. '2', '500g', 'a dozen'",
                },
                category: {
                  type: "string",
                  description: "e.g. 'Dairy', 'Produce', 'Bakery'",
                },
                note: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
        required: ["list_id", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_item",
      description: "Mark an item as done/checked.",
      parameters: {
        type: "object",
        properties: {
          item_id: { type: "string" },
        },
        required: ["item_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "uncheck_item",
      description: "Mark a checked item as not done.",
      parameters: {
        type: "object",
        properties: {
          item_id: { type: "string" },
        },
        required: ["item_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_item",
      description: "Delete an item from a list.",
      parameters: {
        type: "object",
        properties: {
          item_id: { type: "string" },
        },
        required: ["item_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_list",
      description: "Create a new shopping list.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name for the new list." },
        },
        required: ["name"],
      },
    },
  },
];

async function runTool(
  name: string,
  args: Record<string, any>,
  userId: string,
): Promise<unknown> {
  switch (name) {
    case "get_lists": {
      return prisma.userList.findMany({
        where: { userId, status: { not: "PENDING" } },
        include: { List: true },
      });
    }

    case "get_items": {
      const access = await prisma.userList.findFirst({
        where: { listId: args.list_id, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.findMany({
        where: { listId: args.list_id },
        orderBy: { createdAt: "desc" },
      });
    }

    case "add_item": {
      const access = await prisma.userList.findFirst({
        where: { listId: args.list_id, userId },
      });
      if (!access) return { error: "Access denied" };
      return Promise.all(
        (args.items as any[]).map((item) =>
          prisma.item.create({
            data: {
              name: item.name,
              listId: args.list_id,
              quantity: item.quantity ?? null,
              category: item.category ?? null,
              note: item.note ?? null,
              creatorUserId: userId,
            },
          }),
        ),
      );
    }

    case "check_item": {
      const item = await prisma.item.findUnique({
        where: { id: args.item_id },
      });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.update({
        where: { id: args.item_id },
        data: { checked: true },
      });
    }

    case "uncheck_item": {
      const item = await prisma.item.findUnique({
        where: { id: args.item_id },
      });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.update({
        where: { id: args.item_id },
        data: { checked: false },
      });
    }

    case "delete_item": {
      const item = await prisma.item.findUnique({
        where: { id: args.item_id },
      });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      await prisma.item.delete({ where: { id: args.item_id } });
      return { success: true };
    }

    case "create_list": {
      const list = await prisma.list.create({
        data: { name: args.name, ownerId: userId, createdAt: new Date() },
      });
      await prisma.userList.create({
        data: {
          userId,
          listId: list.id,
          createdAt: new Date(),
          status: "OWNER",
        },
      });
      return list;
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export type ChatRequest = Request<{}, any, ChatInput>;

export async function chat(
  req: ChatRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = req.user!;
    const { messages, context } = req.body;

    const contextNote = context?.activeListId
      ? `The user is currently viewing the list "${context.activeListName ?? "unknown"}" (id: ${context.activeListId}). ` +
        `When they say "the list", "this list", or don't specify a list, use this one.`
      : "The user has no list open. If they refer to a list without naming it, call get_lists first to find the right one.";

    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: "system",
      content:
        "You are a concise shopping list assistant. " +
        "Rules: no markdown, no bullet points, no bold/italic, no lists. " +
        "Keep every reply to 1-2 plain sentences. " +
        "If you took an action just say what you did (e.g. 'Added milk and eggs to Groceries.'). " +
        "If you need to ask for confirmation before a destructive action, ask in one short sentence. " +
        "Never enumerate items back to the user unless they explicitly asked you to. " +
        contextNote,
    };

    const conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages,
    ];

    // Agentic loop
    while (true) {
      const response = await openai.chat.completions.create({
        model: "gpt-5.4-nano",
        messages: conversation,
        tools,
        tool_choice: "auto",
      });

      const message = response.choices[0]?.message;
      if (message) conversation.push(message);

      if (!message?.tool_calls || message.tool_calls.length === 0) {
        res.json({ message: message?.content });
        return;
      }

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        message.tool_calls.map(async (call) => {
          if (call.type !== "function") return null;
          const args = JSON.parse(call.function.arguments);
          const result = await runTool(call.function.name, args, userId);
          return {
            role: "tool" as const,
            tool_call_id: call.id,
            content: JSON.stringify(result),
          };
        }),
      );

      conversation.push(...toolResults.filter((r) => r !== null));
    }
  } catch (err) {
    next(err);
  }
}
