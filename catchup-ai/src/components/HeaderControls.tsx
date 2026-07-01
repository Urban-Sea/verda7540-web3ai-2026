"use client";

import { useTheme } from "@/lib/theme";

/** ヘッダー右側のコントロール群: テーマ切替 + ショートカット一覧ボタン */
export default function HeaderControls() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 hidden items-center gap-2 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-gray-400 font-mono tracking-wider">
          LIVE
        </span>
      </span>

      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("catchup:help"))
        }
        title="キーボードショートカット (?)"
        aria-label="キーボードショートカットを表示"
        className="hidden h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 active:scale-95 sm:flex dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-100"
      >
        <span className="text-sm font-bold">?</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "ライトモードにする (t)" : "ダークモードにする (t)"}
        aria-label="テーマを切り替える"
        aria-pressed={isDark}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100"
      >
        {isDark ? (
          // sun
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          // moon
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
