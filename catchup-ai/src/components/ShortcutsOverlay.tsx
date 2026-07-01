"use client";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["j", "k"], label: "記事を上下に移動" },
  { keys: ["o", "Enter"], label: "選択中の記事を開く" },
  { keys: ["m"], label: "選択中の状態を切替（未読→読んだ→理解）" },
  { keys: ["u"], label: "未読のみ表示を切替" },
  { keys: ["d"], label: "今日のブリーフへ" },
  { keys: ["r"], label: "振り返りへ" },
  { keys: ["t"], label: "ライト / ダーク切替" },
  { keys: ["?"], label: "このヘルプを開閉" },
  { keys: ["Esc"], label: "ヘルプ / 選択を解除" },
];

export default function ShortcutsOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="キーボードショートカット"
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black tracking-widest uppercase text-gray-900 dark:text-gray-100">
            ⌨ キーボードショートカット
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="text-gray-600 dark:text-gray-300">
                {s.label}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-6 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-center font-mono text-[11px] font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
          入力欄にフォーカス中はショートカットは無効です。
        </p>
      </div>
    </div>
  );
}
