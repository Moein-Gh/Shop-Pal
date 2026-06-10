import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.js";
import type { AddNewItemInput, BatchAddItemsInput, BatchCheckItemsInput, BatchDeleteItemsInput, EditItemInput } from "../types/item.js";

export type ItemsRequest = Request<{ listId: string }>;

export async function getItems(
  req: ItemsRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { listId } = req.params;
    const list = await prisma.list.findUnique({
      where: { id: listId },
      select: { id: true },
    });
    if (!list) {
      res.status(404).json({ error: "List not found" });
      return;
    }

    const items = await prisma.item.findMany({
      where: { listId: listId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).send(items);
  } catch (err) {
    next(err);
  }
}

export type AddNewItemRequest = Request<{}, any, AddNewItemInput>;

export const addItem = async (req: AddNewItemRequest, res: Response) => {
  try {
    const { name, listId, quantity, category, note } = req.body;
    const { id: userId } = req.user!;

    const userList = await prisma.userList.findFirst({
      where: {
        listId: listId,
        userId: userId,
      },
    });

    if (!userList) {
      res.status(400).send("List not found");
      return;
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        listId,
        quantity: quantity ?? null,
        category: category ?? null,
        note: note ?? null,
        creatorUserId: userId,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
};

export type EditItemRequest = Request<{ itemId: string }, any, EditItemInput>;

export const editItem = async (req: EditItemRequest, res: Response) => {
  try {
    const { name, quantity, category, note } = req.body;
    const { itemId } = req.params;
    const { id: userId } = req.user!;

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      res.status(400).send("Item not found");
      return;
    }

    const editedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(note !== undefined ? { note } : {}),
      },
    });

    res.status(201).json(editedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
};

export type ItemIdRequest = Request<{ itemId: string }>;

export const checkItem = async (req: ItemIdRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { id: userId } = req.user!;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const userList = await prisma.userList.findFirst({
      where: {
        listId: item.listId,
        userId: userId,
      },
    });

    if (!userList) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const checkedItem = await prisma.item.update({
      where: { id: itemId },
      data: { checked: true },
    });

    res.status(200).json(checkedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to check item" });
  }
};

export const uncheckItem = async (req: ItemIdRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { id: userId } = req.user!;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const userList = await prisma.userList.findFirst({
      where: {
        listId: item.listId,
        userId: userId,
      },
    });

    if (!userList) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const uncheckedItem = await prisma.item.update({
      where: { id: itemId },
      data: { checked: false },
    });

    res.status(200).json(uncheckedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to uncheck item" });
  }
};

export type BatchAddItemsRequest = Request<{}, any, BatchAddItemsInput>;

export const batchAddItems = async (req: BatchAddItemsRequest, res: Response) => {
  try {
    const { listId, items } = req.body;
    const { id: userId } = req.user!;

    const userList = await prisma.userList.findFirst({ where: { listId, userId } });
    if (!userList) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const created = await prisma.$transaction(
      items.map((item) =>
        prisma.item.create({
          data: { name: item.name, listId, quantity: item.quantity ?? null, category: item.category ?? null, note: item.note ?? null, creatorUserId: userId },
        }),
      ),
    );

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to batch add items" });
  }
};

export type BatchCheckItemsRequest = Request<{}, any, BatchCheckItemsInput>;

export const batchCheckItems = async (req: BatchCheckItemsRequest, res: Response) => {
  try {
    const { itemIds, checked } = req.body;
    const { id: userId } = req.user!;

    const items = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    const listIds = [...new Set(items.map((i) => i.listId))];
    const access = await prisma.userList.findMany({ where: { listId: { in: listIds }, userId } });
    const accessibleListIds = new Set(access.map((a) => a.listId));
    const allowedIds = items.filter((i) => accessibleListIds.has(i.listId)).map((i) => i.id);

    await prisma.item.updateMany({ where: { id: { in: allowedIds } }, data: { checked } });
    res.status(200).json({ updated: allowedIds.length });
  } catch {
    res.status(500).json({ error: "Failed to batch check items" });
  }
};

export type BatchDeleteItemsRequest = Request<{}, any, BatchDeleteItemsInput>;

export const batchDeleteItems = async (req: BatchDeleteItemsRequest, res: Response) => {
  try {
    const { itemIds } = req.body;
    const { id: userId } = req.user!;

    const items = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    const listIds = [...new Set(items.map((i) => i.listId))];
    const access = await prisma.userList.findMany({ where: { listId: { in: listIds }, userId } });
    const accessibleListIds = new Set(access.map((a) => a.listId));
    const allowedIds = items.filter((i) => accessibleListIds.has(i.listId)).map((i) => i.id);

    await prisma.item.deleteMany({ where: { id: { in: allowedIds } } });
    res.status(200).json({ deleted: allowedIds.length });
  } catch {
    res.status(500).json({ error: "Failed to batch delete items" });
  }
};

export const deleteItem = async (req: ItemIdRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { id: userId } = req.user!;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const userList = await prisma.userList.findFirst({
      where: {
        listId: item.listId,
        userId: userId,
      },
    });

    if (!userList) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    await prisma.item.delete({ where: { id: itemId } });
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};
