"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Article, ArticleSnapshot, Domain, DOMAIN_META } from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import {
  ArticleStatesProvider,
  useArticleStates,
} from "@/lib/articleState";
import { toggleTheme } from "@/lib/theme";
import ArticleCard from "./ArticleCard";
import HeroCard from "./HeroCard";
import ReviewView from "./ReviewView";
import ShortcutsOverlay from "./ShortcutsOverlay";

const DOMAIN_ORDER: Domain[] = [
  "models",
  "agents",
  "safety",
  "policy",
  "infra",
  "industry",
];

type DomainFilter = "all" | Domain;

const STATUS_CYCLE: ("unread" | "read" | "understood")[] = [
  "unread",
  "read",
  "understood",
];

function snapshotOf(a: Article): ArticleSnapshot {
  return {
    title: a.title,
    titleJa: a.titleJa,
    url: a.url,
    source: a.source,
    domain: a.domain,
    publishedAt: a.publishedAt,
  };
}

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
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
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
  const { states, update } = useArticleStates();
  const [mode, setMode] = useState<"daily" | "review">("daily");
  const [filter, setFilter] = useState<DomainFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [helpOpen, setHelpOpen] = useState(false);

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

  // v5: 今日の記事のうち「読む前に予想を書いた」件数
  const stanceCount = articles.filter(
    (a) => (states[a.id]?.stance ?? "").trim() !== ""
  ).length;

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

  // キーボードナビ用: 画面に見えている記事を描画順どおりに一列へ並べる
  const orderedVisible = useMemo<Article[]>(() => {
    const list: Article[] = [];
    if (hero) list.push(hero);
    for (const d of visibleDomains) list.push(...byDomain[d]);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, filter, unreadOnly]);

  const selectedId =
    selectedIndex >= 0 ? orderedVisible[selectedIndex]?.id : undefined;

  // 選択位置は ref でも保持し、連続キー入力に即応 & 更新関数の副作用二重発火を避ける
  const selRef = useRef(-1);
  useEffect(() => {
    selRef.current = selectedIndex;
  }, [selectedIndex]);

  // フィルタ・タブ切替で並びが変わったら選択を解除する（イベント側で呼ぶ）
  const resetSelection = () => {
    selRef.current = -1;
    setSelectedIndex(-1);
  };

  // 最新の状態を ref に載せ、キーハンドラは1回だけ登録する（stale closure 回避）
  const navRef = useRef({
    mode,
    orderedVisible,
    unreadOnly,
    states,
    update,
  });
  useEffect(() => {
    navRef.current = { mode, orderedVisible, unreadOnly, states, update };
  });

  useEffect(() => {
    const scrollTo = (id: string) => {
      const el = document.getElementById(`card-${id}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      // 入力中は Escape で blur だけ許可、他は素通し
      if (typing) {
        if (e.key === "Escape") target?.blur();
        return;
      }

      const { mode: m, orderedVisible: list } = navRef.current;

      // どのモードでも効くグローバル操作
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setHelpOpen(false);
        selRef.current = -1;
        setSelectedIndex(-1);
        return;
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTheme();
        return;
      }
      if (e.key === "d" || e.key === "D") {
        setMode("daily");
        selRef.current = -1;
        setSelectedIndex(-1);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        setMode("review");
        selRef.current = -1;
        setSelectedIndex(-1);
        return;
      }

      // ここから下は「今日のブリーフ」でのみ
      if (m !== "daily" || list.length === 0) return;

      const clampedCur = Math.min(selRef.current, list.length - 1);

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = clampedCur < 0 ? 0 : Math.min(clampedCur + 1, list.length - 1);
        selRef.current = next;
        setSelectedIndex(next);
        if (list[next]) scrollTo(list[next].id);
        return;
      }
      if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = clampedCur <= 0 ? 0 : clampedCur - 1;
        selRef.current = next;
        setSelectedIndex(next);
        if (list[next]) scrollTo(list[next].id);
        return;
      }
      if (e.key === "u" || e.key === "U") {
        setUnreadOnly((v) => !v);
        selRef.current = -1;
        setSelectedIndex(-1);
        return;
      }

      // 選択中の記事に対する操作（副作用はここで1回だけ実行）
      const a = clampedCur >= 0 ? list[clampedCur] : undefined;
      if (!a) return;
      if (e.key === "o" || e.key === "O" || e.key === "Enter") {
        window.open(a.url, "_blank", "noopener,noreferrer");
      } else if (e.key === "m" || e.key === "M") {
        const cur = navRef.current.states[a.id]?.status ?? "unread";
        const idx = STATUS_CYCLE.indexOf(cur);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        navRef.current.update(a.id, { status: next }, snapshotOf(a));
      }
    };

    const onHelp = () => setHelpOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("catchup:help", onHelp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("catchup:help", onHelp);
    };
  }, []);

  const tabBase =
    "text-sm px-4 py-2 rounded-lg font-bold transition-all active:scale-[0.98]";
  const tabActive = "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900";
  const tabIdle =
    "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200";

  const pillActive = "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900";
  const pillIdle =
    "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">
          {today}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {articles.length} 件のAIニュースを 6 領域に分類しました
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {updatedStr ? `最終更新 ${updatedStr} · ` : ""}
            Sources: TechCrunch / The Verge / Ars Technica
          </p>
        </div>
        <div className="h-px bg-gray-900 dark:bg-gray-100 mt-4" />
        <div className="h-px bg-gray-300 dark:bg-gray-700 mt-1" />
      </div>

      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => {
            setMode("daily");
            resetSelection();
          }}
          className={`${tabBase} ${mode === "daily" ? tabActive : tabIdle}`}
        >
          今日のブリーフ
        </button>
        <button
          onClick={() => {
            setMode("review");
            resetSelection();
          }}
          className={`inline-flex items-center gap-2 ${tabBase} ${
            mode === "review" ? tabActive : tabIdle
          }`}
        >
          振り返り
          {pendingTodos > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {pendingTodos}
            </span>
          )}
        </button>

        <span className="ml-auto hidden md:inline text-[11px] text-gray-400 dark:text-gray-500 font-mono">
          <kbd className="rounded border border-gray-200 dark:border-gray-700 px-1">j</kbd>
          /
          <kbd className="rounded border border-gray-200 dark:border-gray-700 px-1">k</kbd>{" "}
          で移動 ·{" "}
          <kbd className="rounded border border-gray-200 dark:border-gray-700 px-1">?</kbd>{" "}
          でヘルプ
        </span>
      </div>

      {mode === "review" && <ReviewView articles={articles} />}

      {mode === "daily" && (
      <>
      <div className="mb-8 rounded-xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
            今日の消化率
          </span>
          <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
            {readCount}
            <span className="text-gray-400 dark:text-gray-500"> / {total}</span>
            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
              {percent}%
            </span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
          🤔 読む前の予想{" "}
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {stanceCount}
          </span>{" "}
          件
          <span className="text-gray-300 dark:text-gray-600">
            {" "}
            · 思考放棄しない第一歩
          </span>
        </p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap items-center">
        <button
          onClick={() => {
            setFilter("all");
            resetSelection();
          }}
          className={`text-xs px-4 py-2 rounded-full font-medium transition-all active:scale-[0.98] ${
            filter === "all" ? pillActive : pillIdle
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
              onClick={() => {
                setFilter(d);
                resetSelection();
              }}
              className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all active:scale-[0.98] ${
                active ? pillActive : pillIdle
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
          onClick={() => {
            setUnreadOnly((v) => !v);
            resetSelection();
          }}
          aria-pressed={unreadOnly}
          className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all active:scale-[0.98] ${
            unreadOnly
              ? "bg-red-600 text-white shadow-sm"
              : pillIdle
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
        <div
          id={`card-${hero.id}`}
          className={`card-anchor mb-10 animate-fade-in rounded-xl transition-shadow ${
            selectedId === hero.id
              ? "ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950"
              : ""
          }`}
        >
          <HeroCard article={hero} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 dark:text-gray-500">
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
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      / {meta.ja}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {items.length} 件
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono hidden md:block">
                    {meta.description}
                  </p>
                </div>
                <div
                  className={`pl-4 border-l-2 ${style.accent} grid grid-cols-1 md:grid-cols-2 gap-4`}
                >
                  {items.map((article, i) => (
                    <div
                      key={article.id}
                      id={`card-${article.id}`}
                      className={`card-anchor animate-fade-in rounded-lg transition-shadow ${
                        selectedId === article.id
                          ? "ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950"
                          : ""
                      }`}
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

      <ShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
