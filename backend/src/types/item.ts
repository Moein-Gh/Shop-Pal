import z from "zod";

export interface Item {
  id: string;
  name: string;
  listId: string;
  quantity?: string;
  category?: string;
  note?: string;
  checked: boolean;
  creatorUserId: string;
  createdAt: Date;
}

export interface EditItemInput {
  name?: string;
  category?: string;
  quantity?: string;
  note?: string;
}

export interface AddNewItemInput {
  name: string;
  listId: string;
  quantity?: string;
  category?: string;
  note?: string;
}

export const ItemsForListSchema = z.object({
  listId: z.uuid(),
});

export const AddNewItemSchema = z.object({
  listId: z.uuid(),
  name: z.string().min(1, "Item name is required"),
  quantity: z.string().optional(),
  category: z.string().optional(),
  note: z.string().optional(),
});

export const EditItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.string().optional(),
  category: z.string().optional(),
  note: z.string().optional(),
});

export const ItemIdSchema = z.object({
  itemId: z.uuid(),
});

export const BatchAddItemsSchema = z.object({
  listId: z.uuid(),
  items: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().optional(),
      category: z.string().optional(),
      note: z.string().optional(),
    }),
  ).min(1),
});

export const BatchCheckItemsSchema = z.object({
  itemIds: z.array(z.uuid()).min(1),
  checked: z.boolean(),
});

export const BatchDeleteItemsSchema = z.object({
  itemIds: z.array(z.uuid()).min(1),
});

export interface BatchAddItemsInput {
  listId: string;
  items: { name: string; quantity?: string; category?: string; note?: string }[];
}

export interface BatchCheckItemsInput {
  itemIds: string[];
  checked: boolean;
}

export interface BatchDeleteItemsInput {
  itemIds: string[];
}
