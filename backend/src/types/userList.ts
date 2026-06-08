export interface UserList {
  id: string;
  userId: string;
  listId: string;
  createdAt: Date;
  status: UserListStatus;
}

export enum UserListStatus {
  OWNER = "OWNER",
  MEMBER = "MEMEBER",
  PENDING = "PENDING",
}
