import type { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import { prisma } from "../libs/prisma.js";
import type { ChatInput } from "../types/chat.js";

const openai = new OpenAI();

export interface PendingAction {
  type: string;
  description: string;
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "request_approval",
      description:
        "Present the planned actions to the user for approval BEFORE executing any write operation " +
        "(add_item, update_item, delete_item, check_item, uncheck_item, create_list). " +
        "You MUST call this first. Do NOT call any write tool until you receive confirmation.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "One sentence describing what you're about to do.",
          },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", description: "Tool name e.g. add_item, delete_item" },
                description: { type: "string", description: "Human-readable description of the action" },
              },
              required: ["type", "description"],
            },
          },
        },
        required: ["summary", "actions"],
      },
    },
  },
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
      description:
        "Add one or more items to a list. Before calling this, you MUST have already called " +
        "get_items to check for duplicates AND called request_approval.",
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
                quantity: { type: "string", description: "e.g. '2', '500g', 'a dozen'" },
                category: { type: "string", description: "e.g. 'Dairy', 'Produce', 'Bakery'" },
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
      name: "update_item",
      description: "Update an existing item's fields (name, quantity, category, note).",
      parameters: {
        type: "object",
        properties: {
          item_id: { type: "string" },
          name: { type: "string" },
          quantity: { type: "string" },
          category: { type: "string" },
          note: { type: "string" },
        },
        required: ["item_id"],
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
        properties: { item_id: { type: "string" } },
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
        properties: { item_id: { type: "string" } },
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
        properties: { item_id: { type: "string" } },
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
    case "request_approval": {
      return { awaiting_approval: true, summary: args.summary, actions: args.actions };
    }

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

      const existingItems = await prisma.item.findMany({
        where: { listId: args.list_id },
        select: { id: true, name: true, quantity: true },
      });

      const results: unknown[] = [];
      for (const item of args.items as any[]) {
        const duplicate = existingItems.find(
          (e) => e.name.toLowerCase() === item.name.toLowerCase(),
        );
        if (duplicate) {
          results.push({
            conflict: true,
            existingItem: duplicate,
            requestedItem: item,
            message: `"${item.name}" already exists in the list (id: ${duplicate.id}, quantity: ${duplicate.quantity ?? "none"}). Ask the user if they want to update it instead.`,
          });
        } else {
          const created = await prisma.item.create({
            data: {
              name: item.name,
              listId: args.list_id,
              quantity: item.quantity ?? null,
              category: item.category ?? null,
              note: item.note ?? null,
              creatorUserId: userId,
            },
          });
          results.push(created);
        }
      }
      return results;
    }

    case "update_item": {
      const item = await prisma.item.findUnique({ where: { id: args.item_id } });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.update({
        where: { id: args.item_id },
        data: {
          ...(args.name !== undefined ? { name: args.name } : {}),
          ...(args.quantity !== undefined ? { quantity: args.quantity } : {}),
          ...(args.category !== undefined ? { category: args.category } : {}),
          ...(args.note !== undefined ? { note: args.note } : {}),
        },
      });
    }

    case "check_item": {
      const item = await prisma.item.findUnique({ where: { id: args.item_id } });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.update({ where: { id: args.item_id }, data: { checked: true } });
    }

    case "uncheck_item": {
      const item = await prisma.item.findUnique({ where: { id: args.item_id } });
      if (!item) return { error: "Item not found" };
      const access = await prisma.userList.findFirst({
        where: { listId: item.listId, userId },
      });
      if (!access) return { error: "Access denied" };
      return prisma.item.update({ where: { id: args.item_id }, data: { checked: false } });
    }

    case "delete_item": {
      const item = await prisma.item.findUnique({ where: { id: args.item_id } });
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
        data: { userId, listId: list.id, createdAt: new Date(), status: "OWNER" },
      });
      return list;
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export type ChatRequest = Request<{}, any, ChatInput>;

export async function chat(req: ChatRequest, res: Response, next: NextFunction) {
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
        "APPROVAL RULE: Before ANY write operation (add_item, update_item, delete_item, check_item, uncheck_item, create_list) " +
        "you MUST call request_approval first listing every action you plan to take. Only proceed after the user says yes/confirmed/ok. " +
        "DUPLICATE RULE: Before calling add_item, always call get_items first to check for existing items with the same name. " +
        "If a duplicate exists, include it in request_approval and ask whether to update quantity/fields or add as new. " +
        "If you took an action just say what you did in one short sentence. " +
        "Never enumerate items back to the user unless they explicitly asked you to. " +
        contextNote,
    };

    const conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [systemMessage, ...messages];

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

      const filtered = toolResults.filter((r) => r !== null);

      // Detect approval request and return it to the frontend
      const approvalResult = filtered.find((r) => {
        try {
          return JSON.parse(r!.content).awaiting_approval === true;
        } catch {
          return false;
        }
      });

      if (approvalResult) {
        const { summary, actions } = JSON.parse(approvalResult.content) as {
          awaiting_approval: true;
          summary: string;
          actions: PendingAction[];
        };
        res.json({ message: summary, pendingActions: actions });
        return;
      }

      conversation.push(...filtered);
    }
  } catch (err) {
    next(err);
  }
}
