import type { List } from "./List";

export type UserListStatus = "OWNER" | "MEMBER" | "PENDING";

export interface UserList {
  id: string;
  userId: string;
  listId: string;
  status: UserListStatus;
  createdAt: string;
  List: List;
}
