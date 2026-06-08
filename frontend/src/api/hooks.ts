import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Item, AddNewItemInput, EditItemInput, List } from "../types";

// Items
export const useGetItemsByList = (listId: string) =>
  useQuery({
    queryKey: ["items", listId],
    queryFn: () => api.getItemsByList(listId).then((res) => res.data),
  });

export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AddNewItemInput) => api.addItem(item).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.listId] });
    },
  });
};

export const useEditItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, item }: { itemId: string; item: EditItemInput }) =>
      api.editItem(itemId, item).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useCheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.checkItem(itemId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useUncheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.uncheckItem(itemId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

// Lists
export const useGetLists = () =>
  useQuery({
    queryKey: ["lists"],
    queryFn: () => api.getLists().then((res) => res.data),
  });

export const useGetList = (listId: string) =>
  useQuery({
    queryKey: ["lists", listId],
    queryFn: () => api.getList(listId).then((res) => res.data),
  });

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      api.createList(name, description).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      name,
      description,
    }: {
      listId: string;
      name?: string;
      description?: string;
    }) => api.updateList(listId, name, description).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};
