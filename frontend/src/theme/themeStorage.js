const KEY = "edumanage-theme";

export function readInitialTheme() {
  if (typeof window === "undefined") return "light";
  const s = localStorage.getItem(KEY);
  if (s === "light" || s === "dark") return s;
  return "light";
}

export function applyThemeToDocument(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function persistTheme(theme) {
  localStorage.setItem(KEY, theme);
}
