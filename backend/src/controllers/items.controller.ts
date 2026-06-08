import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.js";

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
