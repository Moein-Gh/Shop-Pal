import z from "zod";

export interface CreateListInput {
  name: string;
}

export interface UpdateListInput {
  name: string;
}

export const NewListSchema = z.object({
  name: z.string().min(1, "List name cannot be empty"),
});

export interface List {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}
