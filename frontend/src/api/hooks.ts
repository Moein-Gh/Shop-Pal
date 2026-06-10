import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { AddNewItemInput, EditItemInput } from "../types";

// Items
export const useGetItemsByList = (listId: string | null) =>
  useQuery({
    queryKey: ["items", listId],
    queryFn: () => api.getItemsByList(listId!).then((res) => res.data),
    enabled: !!listId,
  });

export const useAddItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AddNewItemInput) =>
      api.addItem(item).then((res) => res.data),
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items", data.listId] });
    },
  });
};

export const useCheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      api.checkItem(itemId).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items", data.listId] });
    },
  });
};

export const useUncheckItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      api.uncheckItem(itemId).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items", data.listId] });
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

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createList(name).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useGetMembers = (listId: string | null) =>
  useQuery({
    queryKey: ["members", listId],
    queryFn: () => api.getMembers(listId!).then((res) => res.data),
    enabled: !!listId,
  });

export const useAddMember = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => api.addMember(listId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", listId] });
    },
  });
};

export const useRemoveMember = (listId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => api.removeMember(listId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", listId] });
    },
  });
};

export const useRenameList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, name }: { listId: string; name: string }) =>
      api.renameList(listId, name).then((res) => res.data),
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

export const useGetInvitations = () =>
  useQuery({
    queryKey: ["invitations"],
    queryFn: () => api.getInvitations().then((res) => res.data),
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.acceptInvitation(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => api.declineInvitation(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
};
