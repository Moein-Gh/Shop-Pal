import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.js";
import { UserListStatus } from "../types/userList.js";

export async function getLists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user!;
    const lists = await prisma.userList.findMany({
      where: { userId: id },
      include: { List: true },
    });

    res.status(200).send(lists);
  } catch (err) {
    next(err);
  }
}

export type CreateListRequest = Request<{}, any, { name: string }>;

export async function createList(
  req: CreateListRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = req.user!;
    const newList = await prisma.list.create({
      data: {
        name: req.body.name,
        ownerId: userId,
        createdAt: new Date(),
      },
    });

    await prisma.userList.create({
      data: {
        userId,
        listId: newList.id,
        createdAt: new Date(),
        status: UserListStatus.OWNER,
      },
    });

    res.status(200).send(newList);
  } catch (err) {
    next(err);
  }
}
