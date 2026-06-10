import axios, { AxiosInstance } from "axios";
import type { AddNewItemInput, EditItemInput, Item } from "../types/Item";

export interface PendingAction {
  type: string;
  description: string;
}
import type { List } from "../types/List";
import type { AuthResponse } from "../types/User";
import type { UserList } from "../types/UserList";

const API_BASE_URL =
  (import.meta as any).env.VITE_API_URL || "http://192.168.1.129:3001";

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL + "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const api = {
  // Auth
  login: (email: string, password: string) =>
    client.post<AuthResponse>("/auth/login", { email, password }),

  register: (email: string, password: string, name?: string) =>
    client.post<AuthResponse>("/auth/register", { email, password, name }),

  // Lists
  getLists: () => client.get<UserList[]>("/lists"),
  createList: (name: string) => client.post<List>("/lists", { name }),
  renameList: (listId: string, name: string) => client.patch<List>(`/lists/${listId}`, { name }),
  deleteList: (listId: string) => client.delete(`/lists/${listId}`),
  getMembers: (listId: string) => client.get<any[]>(`/lists/${listId}/members`),
  addMember: (listId: string, email: string) =>
    client.post(`/lists/${listId}/members`, { email }),
  removeMember: (listId: string, memberId: string) =>
    client.delete(`/lists/${listId}/members/${memberId}`),
  getInvitations: () => client.get<any[]>("/lists/invitations/pending"),
  acceptInvitation: (listId: string) => client.post(`/lists/${listId}/invitations/accept`),
  declineInvitation: (listId: string) => client.post(`/lists/${listId}/invitations/decline`),

  // Chat
  chat: (messages: { role: string; content: string }[], context?: { activeListId?: string; activeListName?: string }, pendingId?: string) =>
    client.post<{ message: string; pendingActions?: PendingAction[]; pendingId?: string }>("/chat", { messages, context, pendingId }),

  // Items
  getItemsByList: (listId: string) => client.get<Item[]>(`/items/${listId}`),
  addItem: (item: AddNewItemInput) => client.post<Item>("/items", item),
  editItem: (itemId: string, item: EditItemInput) =>
    client.patch<Item>(`/items/${itemId}`, item),
  checkItem: (itemId: string) => client.patch<Item>(`/items/check/${itemId}`),
  uncheckItem: (itemId: string) =>
    client.patch<Item>(`/items/uncheck/${itemId}`),
  deleteItem: (itemId: string) => client.delete(`/items/${itemId}`),
  batchAddItems: (listId: string, items: { name: string; quantity?: string; category?: string; note?: string }[]) =>
    client.post<Item[]>("/items/batch", { listId, items }),
  batchCheckItems: (itemIds: string[], checked: boolean) =>
    client.patch<{ updated: number }>("/items/batch/check", { itemIds, checked }),
  batchDeleteItems: (itemIds: string[]) =>
    client.delete<{ deleted: number }>("/items/batch", { data: { itemIds } }),
};

export default client;
