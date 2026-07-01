"use client";

import { useState } from "react";
import { Article, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import { useArticleState } from "@/lib/articleState";
import { timeAgo, fullTimestamp } from "@/lib/timeAgo";
import StanceBlock from "./StanceBlock";

const STATUS_LABELS = { unread: "未読", read: "読んだ", understood: "理解した" };

const RESULT_EMOJI = { none: "", hit: "✅", partial: "〰️", miss: "❌" } as const;

const ACTION_BUTTON = {
  none: {
    label: "＋ 試す",
    className:
      "bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700",
  },
  todo: {
    label: "🎯 試す予定",
    className:
      "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  done: {
    label: "✓ 実践した",
    className:
      "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
};

export default function HeroCard({ article }: { article: Article }) {
  const { state, setComment, setStance, setStanceResult, cycleStatus, cycleAction } =
    useArticleState(article);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeStr = timeAgo(article.publishedAt);

  const noteLabel =
    state.stanceResult !== "none"
      ? `${RESULT_EMOJI[state.stanceResult]} ノート`
      : state.stance.trim() !== "" || state.comment.trim() !== ""
        ? "ノートを開く"
        : state.status === "unread"
          ? "読む前に予想する"
          : "ノートを開く";

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
      <div className="bg-red-600 px-6 py-2 flex items-center gap-3">
        <span className="text-[11px] font-black tracking-widest uppercase text-white">
          Top Story
        </span>
        <span className="text-white/40">·</span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/15 text-white`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${DOMAIN_STYLE[article.domain].dot}`}
          />
          {DOMAIN_META[article.domain].label}
        </span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {article.source}
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span
            className="text-gray-500 dark:text-gray-400"
            title={fullTimestamp(article.publishedAt)}
          >
            {timeStr}
          </span>
          <div className="flex-1" />
          <button
            onClick={cycleAction}
            title="この記事をアクション化（試す → 実践した）"
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all active:scale-95 ${ACTION_BUTTON[state.action].className}`}
          >
            {ACTION_BUTTON[state.action].label}
          </button>
          <button
            onClick={cycleStatus}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all active:scale-95 ${
              state.status === "understood"
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
                : state.status === "read"
                  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30"
                  : "bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
            }`}
          >
            {STATUS_LABELS[state.status]}
          </button>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {article.titleJa}
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            {article.title}
          </p>
        </a>

        {article.summaryJa && (
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-5 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {article.summaryJa}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full dark:text-gray-300 dark:bg-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {isExpanded ? "閉じる" : noteLabel}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
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
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
