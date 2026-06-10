import { atom } from "jotai";
import type { AuthResponse } from "../types";

type AuthState = AuthResponse | null;

function loadAuth(): AuthState {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {}
  return null;
}

export const authAtom = atom<AuthState>(loadAuth());
