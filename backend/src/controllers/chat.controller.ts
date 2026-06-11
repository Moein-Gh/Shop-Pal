import type { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import { prisma } from "../libs/prisma.js";
import type { ChatInput } from "../types/chat.js";

const openai = new OpenAI();

export interface PendingAction {
  type: string;
  description: string;
}

// Short-lived store for paused conversations awaiting user approval.
// Keyed by a random ID returned to the frontend; expires after 10 minutes.
const pendingConversations = new Map<string, {
  conversation: OpenAI.Chat.ChatCompletionMessageParam[];
  expiresAt: number;
}>();

function storePendingConversation(conversation: OpenAI.Chat.ChatCompletionMessageParam[]): string {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  pendingConversations.set(id, { conversation, expiresAt: Date.now() + 10 * 60 * 1000 });
  // Prune expired entries opportunistically
  for (const [key, val] of pendingConversations) {
    if (val.expiresAt < Date.now()) pendingConversations.delete(key);
  }
  return id;
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "request_approval",
      description:
        "Present planned actions to the user for approval BEFORE executing any write operation " +
        "(add_item, update_item, delete_item, check_item, uncheck_item, create_list). " +
        "You MUST call this first.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "One friendly sentence describing what you're about to do.",
          },
          actions: {
            type: "array",
            description: "Human-readable list of actions for the user to review.",
            items: {
              type: "object",
              properties: {
                type: { type: "string", description: "Tool name e.g. add_item, delete_item" },
                description: { type: "string", description: "Plain friendly description, no IDs or technical terms" },
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

// Execution tools: no request_approval — used when resuming after user confirms
const executionTools = tools.filter(
  (t) => t.type === "function" && t.function.name !== "request_approval",
);

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
    const { messages, context, pendingId } = req.body;

    // Resume a stored conversation after user approval — the LLM continues from exactly
    // where it paused, with request_approval removed so it proceeds to execute.
    if (pendingId) {
      const stored = pendingConversations.get(pendingId);
      if (!stored || stored.expiresAt < Date.now()) {
        res.status(410).json({ error: "Approval expired. Please try again." });
        return;
      }
      pendingConversations.delete(pendingId);
      return runLoop(stored.conversation, executionTools, userId, res);
    }

    const contextNote = context?.activeListId
      ? `The user is currently viewing the list "${context.activeListName ?? "unknown"}" (id: ${context.activeListId}). ` +
        `When they say "the list", "this list", or don't specify a list, use this one.`
      : "The user has no list open. If they refer to a list without naming it, call get_lists first to find the right one.";

    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: "system",
      content:
        "You are a friendly grocery shopping assistant. Talk like a helpful friend, not a developer. " +
        "Rules: no markdown, no bullet points, no bold/italic. Keep every reply to 1-2 plain sentences. " +

        "APPROVAL RULE: Before ANY write operation (add_item, update_item, delete_item, check_item, uncheck_item, create_list) " +
        "you MUST call request_approval first. " +

        "DUPLICATE RULE: Before calling add_item, always call get_items first to check for existing items with the same name. " +
        "If a duplicate exists, include it in request_approval and ask whether to update or add as new. " +

        "CATEGORY RULE: Every item MUST have a category — never add an item without one. " +
        "Before adding items, call get_items to see what categories already exist in this list. " +
        "Reuse an existing category if it fits (e.g. if 'Dairy' exists, use 'Dairy' for milk). " +
        "Only create a new category name if none of the existing ones are a reasonable match. " +
        "Standard grocery categories to choose from: Produce, Dairy, Meat & Seafood, Bakery, Frozen, " +
        "Beverages, Snacks, Pantry, Canned Goods, Condiments, Household, Personal Care, Other. " +

        "QUANTITY RULE: You are a grocery assistant, not a recipe assistant. " +
        "Quantities must reflect how items are actually sold in a supermarket — not cooking measurements. " +
        "Never use tablespoons, teaspoons, cups, or other recipe units. " +
        "Use: units (1, 2, 6), weights sold in stores (200g, 500g, 1kg), or retail pack sizes (1 bottle, 1 bag, 1 bunch, 1 can, 1 dozen). " +
        "If a recipe calls for '2 tablespoons of butter', add '1 pack of butter' or '200g butter' — the store-bought equivalent. " +
        "When in doubt about quantity, leave it as a simple count like '1' rather than inventing a measurement. " +

        "ACTION DESCRIPTION RULE: Write action descriptions that show the NEW value, not the current state. " +
        "The user already knows what's missing — they want to see what it will become. " +
        "Never include IDs, UUIDs, technical terms, or explanations like 'since it's not set yet'. " +
        "Good examples: 'Add Milk (1 bottle) — Dairy', 'Add Parmesan (200g) — Dairy', 'Remove Eggs', " +
        "'Change Butter quantity to 200g', 'Mark Bread as done'. " +
        "If you took an action just say what you did in one short friendly sentence. " +
        "Never enumerate items back to the user unless they explicitly asked you to. " +
        contextNote,
    };

    const conversation: OpenAI.Chat.ChatCompletionMessageParam[] = [systemMessage, ...messages];
    return runLoop(conversation, tools, userId, res);
  } catch (err) {
    next(err);
  }
}

async function runLoop(
  conversation: OpenAI.Chat.ChatCompletionMessageParam[],
  activeTools: OpenAI.Chat.ChatCompletionTool[],
  userId: string,
  res: Response,
) {
  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: conversation,
      tools: activeTools,
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

    // Detect approval request: store the full conversation and pause for user confirmation.
    // The conversation is resumed on the next request via pendingId — no re-planning needed.
    const approvalResult = filtered.find((r) => {
      try { return JSON.parse(r!.content).awaiting_approval === true; } catch { return false; }
    });

    if (approvalResult) {
      const { summary, actions } = JSON.parse(approvalResult.content) as {
        awaiting_approval: true;
        summary: string;
        actions: PendingAction[];
      };
      // Store conversation state AFTER the request_approval tool result so the LLM
      // resumes knowing approval was granted and proceeds to the actual tool calls.
      conversation.push(...filtered);
      conversation.push({ role: "user", content: "Yes, approved. Please proceed." });
      const pendingId = storePendingConversation(conversation);
      res.json({ message: summary, pendingActions: actions, pendingId });
      return;
    }

    conversation.push(...filtered);
  }
}
