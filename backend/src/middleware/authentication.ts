import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import type { User } from "../types/user.js";
const secret = process.env["JWT_SECRET"];

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7).trim();

  try {
    if (!secret) {
      res.status(500).json({ error: "JWT_SECRET not configured" });
      return;
    }

    const decoded = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: (decoded as { userId: string }).userId },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword as Omit<User, "password">;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
