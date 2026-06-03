"use client";

import { useState, useEffect } from "react";
import { Article, ArticleState, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";

const STATUS_LABELS = { unread: "未読", read: "読んだ", understood: "理解した" };
const STATUS_CYCLE: ArticleState["status"][] = ["unread", "read", "understood"];

function getStorageKey(id: string) {
  return `catchup-ai-article-${id}`;
}

export default function HeroCard({ article }: { article: Article }) {
  const [state, setState] = useState<ArticleState>({
    comment: "",
    status: "unread",
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(article.id));
    if (saved) setState(JSON.parse(saved));
  }, [article.id]);

  function updateState(patch: Partial<ArticleState>) {
    const next = { ...state, ...patch };
    setState(next);
    localStorage.setItem(getStorageKey(article.id), JSON.stringify(next));
  }

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(state.status);
    updateState({ status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] });
  }

  const date = new Date(article.publishedAt);
  const timeStr = date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
        <div className="flex items-center gap-3 mb-4 text-sm">
          <span className="font-semibold text-gray-900">{article.source}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">{timeStr}</span>
          <div className="flex-1" />
          <button
            onClick={cycleStatus}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              state.status === "understood"
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : state.status === "read"
                  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                  : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
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
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2 group-hover:text-red-600 transition-colors">
            {article.titleJa}
          </h2>
          <p className="text-sm text-gray-400 mb-4">{article.title}</p>
        </a>

        {article.summaryJa && (
          <p className="text-base text-gray-600 leading-relaxed mb-5 border-l-2 border-gray-200 pl-4">
            {article.summaryJa}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
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
            {isExpanded ? "閉じる" : "メモを書く"}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <textarea
              value={state.comment}
              onChange={(e) => updateState({ comment: e.target.value })}
              placeholder="自分の言葉でメモを残す（思考放棄しない！）"
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
              rows={3}
            />
          </div>
        )}
      </div>
    </article>
  );
}
