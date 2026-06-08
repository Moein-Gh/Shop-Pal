export interface Item {
  id: string;
  name: string;
  listId: string;
  quantity?: string;
  category?: string;
  note?: string;
  checked: boolean;
  creatorUserId: string;
  createdAt: string;
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
