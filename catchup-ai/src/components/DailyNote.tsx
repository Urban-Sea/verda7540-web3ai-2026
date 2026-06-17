"use client";

import { useEffect, useState } from "react";
import { Article, Domain, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import {
  ArticleStatesProvider,
  useArticleStates,
} from "@/lib/articleState";
import ArticleCard from "./ArticleCard";
import HeroCard from "./HeroCard";
import ReviewView from "./ReviewView";

const DOMAIN_ORDER: Domain[] = [
  "models",
  "agents",
  "safety",
  "policy",
  "infra",
  "industry",
];

type DomainFilter = "all" | Domain;

export default function DailyNote() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setFetchedAt(data.fetchedAt || null);
        setLoading(false);
      })
      .catch(() => {
        setError("ニュースの取得に失敗しました");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-8 w-64 rounded-lg" />
        <div className="shimmer h-4 w-40 rounded" />
        <div className="shimmer h-72 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-44 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <ArticleStatesProvider>
      <DailyNoteBody articles={articles} fetchedAt={fetchedAt} />
    </ArticleStatesProvider>
  );
}

function DailyNoteBody({
  articles,
  fetchedAt,
}: {
  articles: Article[];
  fetchedAt: string | null;
}) {
  const { states } = useArticleStates();
  const [mode, setMode] = useState<"daily" | "review">("daily");
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // 振り返りタブに「未完了の試す」件数バッジを出す
  const pendingTodos = Object.values(states).filter(
    (s) => s.action === "todo"
  ).length;

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const updatedStr = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isUnread = (a: Article) =>
    (states[a.id]?.status ?? "unread") === "unread";

  const readCount = articles.filter((a) => !isUnread(a)).length;
  const total = articles.length;
  const percent = total > 0 ? Math.round((readCount / total) * 100) : 0;

  const counts: Record<DomainFilter, number> = {
    all: articles.length,
    models: 0,
    agents: 0,
    safety: 0,
    policy: 0,
    infra: 0,
    industry: 0,
  };
  for (const a of articles) counts[a.domain] += 1;

  const byDomainAll =
    filter === "all" ? articles : articles.filter((a) => a.domain === filter);
  const filtered = unreadOnly ? byDomainAll.filter(isUnread) : byDomainAll;

  const hero = filter === "all" ? filtered[0] : null;
  const restAll = hero ? filtered.slice(1) : filtered;

  const byDomain: Record<Domain, Article[]> = {
    models: [],
    agents: [],
    safety: [],
    policy: [],
    infra: [],
    industry: [],
  };
  for (const a of restAll) byDomain[a.domain].push(a);

  const visibleDomains =
    filter === "all"
      ? DOMAIN_ORDER.filter((d) => byDomain[d].length > 0)
      : [filter as Domain];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-1">
          {today}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {articles.length} 件のAIニュースを 6 領域に分類しました
          </p>
          <p className="text-xs text-gray-400 font-mono">
            {updatedStr ? `最終更新 ${updatedStr} · ` : ""}
            Sources: TechCrunch / The Verge / Ars Technica
          </p>
        </div>
        <div className="h-px bg-gray-900 mt-4" />
        <div className="h-px bg-gray-300 mt-1" />
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode("daily")}
          className={`text-sm px-4 py-2 rounded-lg font-bold transition-all ${
            mode === "daily"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          今日のブリーフ
        </button>
        <button
          onClick={() => setMode("review")}
          className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-bold transition-all ${
            mode === "review"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          振り返り
          {pendingTodos > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {pendingTodos}
            </span>
          )}
        </button>
      </div>

      {mode === "review" && <ReviewView articles={articles} />}

      {mode === "daily" && (
      <>
      <div className="mb-8 rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
            今日の消化率
          </span>
          <span className="text-sm font-mono text-gray-900">
            {readCount}
            <span className="text-gray-400"> / {total}</span>
            <span className="ml-2 text-emerald-600 font-bold">{percent}%</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap items-center">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
            filter === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          全領域
          <span className="ml-1.5 opacity-60">{counts.all}</span>
        </button>
        {DOMAIN_ORDER.map((d) => {
          const active = filter === d;
          return (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${
                active
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${DOMAIN_STYLE[d].dot}`}
              />
              {DOMAIN_META[d].label}
              <span className="opacity-60">{counts[d]}</span>
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => setUnreadOnly((v) => !v)}
          aria-pressed={unreadOnly}
          className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${
            unreadOnly
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              unreadOnly ? "bg-white" : "bg-red-500"
            }`}
          />
          未読のみ
        </button>
      </div>

      {hero && (
        <div className="mb-10 animate-fade-in">
          <HeroCard article={hero} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">
            {unreadOnly
              ? "未読の記事はありません 🎉"
              : "該当する記事がありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleDomains.map((d) => {
            const items = byDomain[d];
            if (items.length === 0) return null;
            const style = DOMAIN_STYLE[d];
            const meta = DOMAIN_META[d];
            return (
              <section key={d} className="animate-fade-in">
                <div className="mb-4 flex items-baseline justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                    />
                    <h3
                      className={`text-xs font-black tracking-[0.2em] uppercase ${style.laneHeader}`}
                    >
                      {meta.label}
                    </h3>
                    <span className="text-sm text-gray-400">/ {meta.ja}</span>
                    <span className="text-xs text-gray-400">
                      {items.length} 件
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono hidden md:block">
                    {meta.description}
                  </p>
                </div>
                <div
                  className={`pl-4 border-l-2 ${style.accent} grid grid-cols-1 md:grid-cols-2 gap-4`}
                >
                  {items.map((article, i) => (
                    <div
                      key={article.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}
