import { z } from "zod";

export interface GoogleAuthPayload {
  googleId: string;
  email: string;
  name: string;
}

export const GoogleAuthSchema = z.object({
  idToken: z.string(),
});

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface User {
  id: string;
  googleId?: string;
  email: string;
  password?: string;
  name: string;
  createdAt: Date;
}
