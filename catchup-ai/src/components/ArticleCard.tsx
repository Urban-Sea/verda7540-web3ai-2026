"use client";

import { useState } from "react";
import { Article, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import { useArticleState } from "@/lib/articleState";
import { timeAgo, fullTimestamp } from "@/lib/timeAgo";
import StanceBlock from "./StanceBlock";

const PRIORITY_BAR = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300 dark:bg-gray-700",
};

const RESULT_EMOJI = { none: "", hit: "✅", partial: "〰️", miss: "❌" } as const;

const STATUS_LABELS = {
  unread: "未読",
  read: "読んだ",
  understood: "理解した",
};

const ACTION_BUTTON = {
  none: {
    label: "＋ 試す",
    className: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
  },
  todo: {
    label: "🎯 試す予定",
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  done: {
    label: "✓ 実践した",
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

export default function ArticleCard({ article }: { article: Article }) {
  const { state, setComment, setStance, setStanceResult, cycleStatus, cycleAction } =
    useArticleState(article);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeStr = timeAgo(article.publishedAt);

  // 未読×予想なしのときは「予想する」と促し、答え合わせ済みなら結果絵文字を出す
  const noteLabel =
    state.stanceResult !== "none"
      ? `${RESULT_EMOJI[state.stanceResult]} ノート`
      : state.stance.trim() !== "" || state.comment.trim() !== ""
        ? "✍️ ノート"
        : state.status === "unread"
          ? "🤔 予想する"
          : "✍️ ノート";

  return (
    <article
      className={`group h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 ${state.status === "understood" ? "opacity-50" : ""}`}
    >
      <div className={`h-1 ${PRIORITY_BAR[article.priority]}`} />

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${DOMAIN_STYLE[article.domain].badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${DOMAIN_STYLE[article.domain].dot}`}
            />
            {DOMAIN_META[article.domain].label.toUpperCase()}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
            {article.source}
          </span>
          <span
            className="text-xs text-gray-400 dark:text-gray-500"
            title={fullTimestamp(article.publishedAt)}
          >
            {timeStr}
          </span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group/link"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug mb-1 group-hover/link:text-red-600 dark:group-hover/link:text-red-400 transition-colors line-clamp-2">
            {article.titleJa}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
            {article.title}
          </p>
        </a>

        {article.summaryJa && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
            {article.summaryJa}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded dark:text-gray-500 dark:bg-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
            >
              {isExpanded ? "閉じる" : noteLabel}
            </button>
            <button
              onClick={cycleAction}
              title="この記事をアクション化（試す → 実践した）"
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all active:scale-95 ${ACTION_BUTTON[state.action].className}`}
            >
              {ACTION_BUTTON[state.action].label}
            </button>
            <button
              onClick={cycleStatus}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all active:scale-95 ${
                state.status === "understood"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : state.status === "read"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}
            >
              {STATUS_LABELS[state.status]}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <StanceBlock
              stance={state.stance}
              result={state.stanceResult}
              onStanceChange={setStance}
              onResultChange={setStanceResult}
              rows={2}
            />
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400">
                📝 読んだあとのメモ
              </label>
              <textarea
                value={state.comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="自分の言葉でメモを残す（思考放棄しない！）"
                className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-red-500/50"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
