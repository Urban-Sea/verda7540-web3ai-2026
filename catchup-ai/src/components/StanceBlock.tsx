"use client";

import { ArticleState } from "@/lib/types";

type Result = Exclude<ArticleState["stanceResult"], "none">;

const RESULTS: { key: Result; label: string; on: string; off: string }[] = [
  {
    key: "hit",
    label: "✅ 当たり",
    on: "bg-emerald-500 text-white border-emerald-500",
    off: "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600",
  },
  {
    key: "partial",
    label: "〰️ 部分的",
    on: "bg-amber-500 text-white border-amber-500",
    off: "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600",
  },
  {
    key: "miss",
    label: "❌ 外れ",
    on: "bg-rose-500 text-white border-rose-500",
    off: "border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-600",
  },
];

/**
 * v5「自分の見解レイヤー」: 記事を読む前に予想を書き、読んだあとに答え合わせする。
 * ArticleCard / HeroCard の両方で再利用する共通ブロック。
 */
export default function StanceBlock({
  stance,
  result,
  onStanceChange,
  onResultChange,
  rows = 2,
}: {
  stance: string;
  result: ArticleState["stanceResult"];
  onStanceChange: (value: string) => void;
  onResultChange: (value: ArticleState["stanceResult"]) => void;
  rows?: number;
}) {
  const hasStance = stance.trim() !== "";

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-indigo-500">
        🤔 読む前の予想・スタンス
        <span className="font-normal text-gray-400">
          タイトルだけ見て結論を当ててみる
        </span>
      </label>
      <textarea
        value={stance}
        onChange={(e) => onStanceChange(e.target.value)}
        placeholder="例: たぶん〇〇の発表で、△△に効いてくるはず…"
        className="w-full text-sm p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
        rows={rows}
      />
      {hasStance && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-gray-400">読んだ結果 →</span>
          {RESULTS.map((r) => {
            const active = result === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => onResultChange(active ? "none" : r.key)}
                aria-pressed={active}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium border transition-all ${
                  active ? r.on : r.off
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
