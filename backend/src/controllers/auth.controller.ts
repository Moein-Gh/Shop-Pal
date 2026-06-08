import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import type { AuthResponse, GoogleAuthPayload } from "../types/user.js";

const GOOGLE_CLIENT_ID = process.env["GOOGLE_CLIENT_ID"];
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function signToken(userId: string): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

export async function googleAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { idToken } = req.body as { idToken: string };

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const googlePayload: GoogleAuthPayload = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
    };

    const user = await prisma.user.upsert({
      where: { googleId: googlePayload.googleId },
      update: { email: googlePayload.email, name: googlePayload.name },
      create: {
        googleId: googlePayload.googleId,
        email: googlePayload.email,
        name: googlePayload.name,
      },
    });

    const response: AuthResponse = {
      token: signToken(user.id),
      user: { id: user.id, email: user.email, name: user.name },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? null },
    });

    const response: AuthResponse = {
      token: signToken(user.id),
      user: { id: user.id, email: user.email, name: user.name },
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const response: AuthResponse = {
      token: signToken(user.id),
      user: { id: user.id, email: user.email, name: user.name },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}
