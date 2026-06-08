export interface CreateItemInput {
  text: string;
  listId: string;
}

export interface UpdateItemInput {
  name?: string;
  category?: string;
  quantity?: string;
  note?: string;
  checked?: boolean;
}
