"use client";

import { useState } from "react";
import { Article, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import { useArticleState } from "@/lib/articleState";
import { timeAgo, fullTimestamp } from "@/lib/timeAgo";

const PRIORITY_BAR = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

const STATUS_LABELS = {
  unread: "未読",
  read: "読んだ",
  understood: "理解した",
};

export default function ArticleCard({ article }: { article: Article }) {
  const { state, setComment, cycleStatus } = useArticleState(article.id);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeStr = timeAgo(article.publishedAt);

  return (
    <article
      className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all ${state.status === "understood" ? "opacity-50" : ""}`}
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
          <span className="text-xs font-medium text-gray-900">
            {article.source}
          </span>
          <span
            className="text-xs text-gray-400"
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
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 group-hover/link:text-red-600 transition-colors line-clamp-2">
            {article.titleJa}
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">{article.title}</p>
        </a>

        {article.summaryJa && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {article.summaryJa}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? "閉じる" : "メモ"}
            </button>
            <button
              onClick={cycleStatus}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                state.status === "understood"
                  ? "bg-emerald-50 text-emerald-600"
                  : state.status === "read"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {STATUS_LABELS[state.status]}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <textarea
              value={state.comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="自分の言葉でメモを残す（思考放棄しない！）"
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
              rows={2}
            />
          </div>
        )}
      </div>
    </article>
  );
}
