import axios, { AxiosInstance } from "axios";
import { AddNewItemInput, EditItemInput, Item } from "../types/Item";
import { List } from "../types/List";
import { AuthResponse } from "../types/User";

const API_BASE_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3001";

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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const api = {
  // Auth
  login: (email: string, password: string) =>
    client.post<AuthResponse>("/auth/login", { email, password }),

  signup: (email: string, password: string, name?: string) =>
    client.post<AuthResponse>("/auth/signup", { email, password, name }),

  // Items
  getItemsByList: (listId: string) => client.get<Item[]>(`/items/${listId}`),

  addItem: (item: AddNewItemInput) => client.post<Item>("/items", item),

  editItem: (itemId: string, item: EditItemInput) =>
    client.patch<Item>(`/items/${itemId}`, item),

  checkItem: (itemId: string) => client.patch<Item>(`/items/check/${itemId}`),

  uncheckItem: (itemId: string) =>
    client.patch<Item>(`/items/uncheck/${itemId}`),

  deleteItem: (itemId: string) => client.delete(`/items/${itemId}`),

  // Lists
  getLists: () => client.get<List[]>("/lists"),

  getList: (listId: string) => client.get<List>(`/lists/${listId}`),

  createList: (name: string, description?: string) =>
    client.post<List>("/lists", { name, description }),

  updateList: (listId: string, name?: string, description?: string) =>
    client.patch<List>(`/lists/${listId}`, { name, description }),

  deleteList: (listId: string) => client.delete(`/lists/${listId}`),
};

export default client;
