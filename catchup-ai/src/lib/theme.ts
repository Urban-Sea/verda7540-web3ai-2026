"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "catchup-ai-theme";
const EVENT = "catchup:themechange";

// 初回描画前に <head> の inline script が付ける .dark クラスと同じ判定をここでも使う。
// これでハイドレーション後もチラつかず一貫する。
function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // storage 不可でも見た目は切り替える
  }
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/** ヘッダーのトグルとキーボードショートカット両方から購読できる薄いフック */
export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // マウント時に確定済みのテーマ（localStorage / OS 設定）へ同期する正当なパターン
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(getStoredTheme() ?? systemTheme());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "dark" || detail === "light") setThemeState(detail);
      else setThemeState(currentTheme());
    };
    window.addEventListener(EVENT, onChange);

    // OS 設定変更にも追従（ユーザーが明示選択していないときのみ）
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (getStoredTheme() === null) {
        const t = systemTheme();
        applyTheme(t);
        setThemeState(t);
      }
    };
    mq.addEventListener("change", onSystem);

    return () => {
      window.removeEventListener(EVENT, onChange);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  return [theme, setTheme];
}
