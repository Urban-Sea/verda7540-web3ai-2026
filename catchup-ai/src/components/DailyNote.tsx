"use client";

import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import HeroCard from "./HeroCard";

export default function DailyNote() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

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

  const filtered =
    filter === "all" ? articles : articles.filter((a) => a.priority === filter);

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const counts = {
    all: articles.length,
    high: articles.filter((a) => a.priority === "high").length,
    medium: articles.filter((a) => a.priority === "medium").length,
    low: articles.filter((a) => a.priority === "low").length,
  };

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

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-1">
          {today}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {articles.length} 件のAIニュースを自動収集しました
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Sources: TechCrunch / The Verge / Ars Technica
          </p>
        </div>
        <div className="h-px bg-gray-900 mt-4" />
        <div className="h-px bg-gray-300 mt-1" />
      </div>

      <div className="flex gap-2 mb-8">
        {(
          [
            { key: "all", label: "すべて" },
            { key: "high", label: "High Priority" },
            { key: "medium", label: "Medium" },
            { key: "low", label: "Low" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.key
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-60">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {hero && (
        <div className="mb-6 animate-fade-in">
          <HeroCard article={hero} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rest.map((article, i) => (
          <div
            key={article.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">該当する記事がありません</p>
        </div>
      )}
    </div>
  );
}
