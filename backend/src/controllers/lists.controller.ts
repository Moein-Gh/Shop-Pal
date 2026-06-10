import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma.js";
import { UserListStatus } from "../types/userList.js";
import type { UserListStatusEnum } from "../generated/prisma/enums.js";

export async function getLists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user!;
    const lists = await prisma.userList.findMany({
      where: { userId: id, status: { not: "PENDING" } },
      include: { List: true },
    });

    res.status(200).send(lists);
  } catch (err) {
    next(err);
  }
}

export async function renameList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);
    const { name } = req.body as { name: string };

    const access = await prisma.userList.findFirst({ where: { listId, userId, status: "OWNER" } });
    if (!access) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.list.update({ where: { id: listId }, data: { name } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteList(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);

    const access = await prisma.userList.findFirst({ where: { listId, userId, status: "OWNER" } });
    if (!access) return res.status(403).json({ error: "Forbidden" });

    await prisma.item.deleteMany({ where: { listId } });
    await prisma.userList.deleteMany({ where: { listId } });
    await prisma.list.delete({ where: { id: listId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getInvitations(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const invitations = await prisma.userList.findMany({
      where: { userId, status: "PENDING" },
      include: { List: { include: { owner: { select: { id: true, name: true, email: true } } } } },
    });
    res.json(invitations);
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);

    const entry = await prisma.userList.findFirst({ where: { listId, userId, status: "PENDING" } });
    if (!entry) return res.status(404).json({ error: "Invitation not found" });

    const updated = await prisma.userList.update({ where: { id: entry.id }, data: { status: "MEMBER" } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function declineInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);

    const entry = await prisma.userList.findFirst({ where: { listId, userId, status: "PENDING" } });
    if (!entry) return res.status(404).json({ error: "Invitation not found" });

    await prisma.userList.delete({ where: { id: entry.id } });
    res.status(204).send();
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

export async function getMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);

    const access = await prisma.userList.findFirst({ where: { listId, userId } });
    if (!access) return res.status(403).json({ error: "Forbidden" });

    const members = await prisma.userList.findMany({
      where: { listId },
      include: { User: { select: { id: true, name: true, email: true } } },
    });

    res.json(members);
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);
    const { email } = req.body as { email: string };

    const access = await prisma.userList.findFirst({ where: { listId, userId } });
    if (!access) return res.status(403).json({ error: "Forbidden" });

    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) return res.status(404).json({ error: "User not found" });

    const existing = await prisma.userList.findFirst({ where: { listId, userId: target.id } });
    if (existing) return res.status(409).json({ error: "Already a member" });

    const entry = await prisma.userList.create({
      data: { userId: target.id, listId, createdAt: new Date(), status: "PENDING" as UserListStatusEnum },
      include: { User: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.user!;
    const listId = String(req.params["listId"]);
    const memberId = String(req.params["memberId"]);

    const myAccess = await prisma.userList.findFirst({ where: { listId, userId } });
    if (!myAccess) return res.status(403).json({ error: "Forbidden" });

    const isOwner = myAccess.status === "OWNER";
    if (!isOwner && memberId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.userList.deleteMany({ where: { listId, userId: memberId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
