"use client";

import { useState, useEffect } from "react";
import { Article, Domain, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import ArticleCard from "./ArticleCard";
import HeroCard from "./HeroCard";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DomainFilter>("all");

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        setError("ニュースの取得に失敗しました");
        setLoading(false);
      });
  }, []);

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

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

  const filtered =
    filter === "all" ? articles : articles.filter((a) => a.domain === filter);

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
            Sources: TechCrunch / The Verge / Ars Technica
          </p>
        </div>
        <div className="h-px bg-gray-900 mt-4" />
        <div className="h-px bg-gray-300 mt-1" />
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
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
      </div>

      {hero && (
        <div className="mb-10 animate-fade-in">
          <HeroCard article={hero} />
        </div>
      )}

      {visibleDomains.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">該当する記事がありません</p>
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
    </div>
  );
}
