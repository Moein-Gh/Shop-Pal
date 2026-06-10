import { atom } from "jotai";

export type ThemeMode = "light" | "dark" | "system";

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (mode !== "system") root.classList.add(mode);
  localStorage.setItem("theme", mode);
}

const baseThemeAtom = atom<ThemeMode>(getInitialTheme());

export const themeAtom = atom(
  (get) => get(baseThemeAtom),
  (_get, set, mode: ThemeMode) => {
    set(baseThemeAtom, mode);
    applyTheme(mode);
  },
);

// Apply on load
applyTheme(getInitialTheme());
