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
