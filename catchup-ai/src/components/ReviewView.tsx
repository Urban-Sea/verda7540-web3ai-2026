"use client";

import { useMemo, useState } from "react";
import {
  Article,
  ArticleSnapshot,
  ArticleState,
  DOMAIN_META,
} from "@/lib/types";
import { DOMAIN_STYLE } from "@/lib/domainStyle";
import { useArticleStates } from "@/lib/articleState";
import { timeAgo, fullTimestamp } from "@/lib/timeAgo";

type Period = "today" | "week" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "all", label: "すべて" },
];

const STATUS_PILL: Record<ArticleState["status"], string> = {
  unread: "bg-gray-100 text-gray-400",
  read: "bg-blue-50 text-blue-600",
  understood: "bg-emerald-50 text-emerald-600",
};
const STATUS_LABELS: Record<ArticleState["status"], string> = {
  unread: "未読",
  read: "読んだ",
  understood: "理解した",
};

interface ReviewEntry {
  id: string;
  state: ArticleState;
  info: ArticleSnapshot | null;
}

const DAY_MS = 86_400_000;

function withinPeriod(iso: string | undefined, period: Period): boolean {
  if (period === "all") return true;
  if (!iso) return false; // 旧データ（記録時刻なし）は「すべて」でのみ表示
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  if (period === "week") return now - t <= 7 * DAY_MS;
  const d = new Date(t);
  const n = new Date(now);
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function byUpdatedDesc(a: ReviewEntry, b: ReviewEntry): number {
  return (
    new Date(b.state.updatedAt ?? 0).getTime() -
    new Date(a.state.updatedAt ?? 0).getTime()
  );
}

function DomainBadge({ info }: { info: ArticleSnapshot }) {
  const style = DOMAIN_STYLE[info.domain];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {DOMAIN_META[info.domain].label.toUpperCase()}
    </span>
  );
}

function ArticleLink({ info }: { info: ArticleSnapshot | null }) {
  if (!info) {
    return <span className="text-sm text-gray-400">(記事情報なし)</span>;
  }
  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-bold text-gray-900 leading-snug hover:text-red-600 transition-colors line-clamp-2"
    >
      {info.titleJa || info.title}
    </a>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${accent}`}>
        {value}
      </p>
    </div>
  );
}

export default function ReviewView({ articles }: { articles: Article[] }) {
  const { states, update } = useArticleStates();
  const [period, setPeriod] = useState<Period>("all");

  const todayById = useMemo(() => {
    const m: Record<string, Article> = {};
    for (const a of articles) m[a.id] = a;
    return m;
  }, [articles]);

  const entries = useMemo<ReviewEntry[]>(() => {
    return Object.entries(states).map(([id, state]) => {
      const t = todayById[id];
      const info: ArticleSnapshot | null =
        state.snapshot ??
        (t
          ? {
              title: t.title,
              titleJa: t.titleJa,
              url: t.url,
              source: t.source,
              domain: t.domain,
              publishedAt: t.publishedAt,
            }
          : null);
      return { id, state, info };
    });
  }, [states, todayById]);

  const inPeriod = useMemo(
    () => entries.filter((e) => withinPeriod(e.state.updatedAt, period)),
    [entries, period]
  );

  const memoCount = inPeriod.filter((e) => e.state.comment.trim() !== "").length;
  const readCount = inPeriod.filter((e) => e.state.status !== "unread").length;
  const understoodCount = inPeriod.filter(
    (e) => e.state.status === "understood"
  ).length;
  const todoCount = inPeriod.filter((e) => e.state.action === "todo").length;
  const doneCount = inPeriod.filter((e) => e.state.action === "done").length;

  const actions = useMemo(
    () =>
      inPeriod
        .filter((e) => e.state.action !== "none")
        .sort((a, b) => {
          // 未完了（試す予定）を上に、その中で新しい順
          if (a.state.action !== b.state.action) {
            return a.state.action === "todo" ? -1 : 1;
          }
          return byUpdatedDesc(a, b);
        }),
    [inPeriod]
  );

  const memos = useMemo(
    () =>
      inPeriod
        .filter((e) => e.state.comment.trim() !== "")
        .sort(byUpdatedDesc),
    [inPeriod]
  );

  const toggleDone = (e: ReviewEntry) =>
    update(e.id, { action: e.state.action === "done" ? "todo" : "done" });

  if (entries.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-4">📓</p>
        <p className="text-gray-500 font-medium mb-1">
          まだ振り返るノートがありません
        </p>
        <p className="text-sm text-gray-400">
          「今日のブリーフ」で気になった記事にメモを書いたり、
          <br />
          「＋試す」でアクション化すると、ここに積み上がっていきます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 期間切り替え */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">期間</span>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              period === p.key
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 振り返り指標 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile label="メモ" value={memoCount} accent="text-gray-900" />
        <StatTile label="読んだ" value={readCount} accent="text-blue-600" />
        <StatTile
          label="理解した"
          value={understoodCount}
          accent="text-emerald-600"
        />
        <StatTile label="試す予定" value={todoCount} accent="text-amber-600" />
        <StatTile label="実践した" value={doneCount} accent="text-emerald-600" />
      </div>

      {/* アクション（試すこと） */}
      <section>
        <div className="mb-4 flex items-baseline gap-3">
          <h3 className="text-xs font-black tracking-[0.2em] uppercase text-amber-600">
            🎯 試すこと（アクション）
          </h3>
          <span className="text-xs text-gray-400">{actions.length} 件</span>
        </div>
        {actions.length === 0 ? (
          <p className="text-sm text-gray-400 rounded-xl border border-dashed border-gray-200 px-5 py-6 text-center">
            アクション化した記事はまだありません。気になった記事の「＋試す」を押そう。
          </p>
        ) : (
          <div className="space-y-2">
            {actions.map((e) => (
              <div
                key={e.id}
                className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3 ${
                  e.state.action === "done"
                    ? "border-gray-100 opacity-60"
                    : "border-amber-200"
                }`}
              >
                <button
                  onClick={() => toggleDone(e)}
                  aria-pressed={e.state.action === "done"}
                  title={e.state.action === "done" ? "未完了に戻す" : "実践したにする"}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border flex items-center justify-center text-[11px] font-black transition-all ${
                    e.state.action === "done"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-300 text-transparent hover:border-emerald-400"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {e.info && <DomainBadge info={e.info} />}
                    {e.info && (
                      <span className="text-xs text-gray-500">
                        {e.info.source}
                      </span>
                    )}
                    {e.state.updatedAt && (
                      <span
                        className="text-[11px] text-gray-400"
                        title={fullTimestamp(e.state.updatedAt)}
                      >
                        {timeAgo(e.state.updatedAt)}
                      </span>
                    )}
                  </div>
                  <div
                    className={
                      e.state.action === "done" ? "line-through" : undefined
                    }
                  >
                    <ArticleLink info={e.info} />
                  </div>
                  {e.state.comment.trim() !== "" && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {e.state.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* メモ一覧 */}
      <section>
        <div className="mb-4 flex items-baseline gap-3">
          <h3 className="text-xs font-black tracking-[0.2em] uppercase text-gray-700">
            📝 書いたメモ
          </h3>
          <span className="text-xs text-gray-400">{memos.length} 件</span>
        </div>
        {memos.length === 0 ? (
          <p className="text-sm text-gray-400 rounded-xl border border-dashed border-gray-200 px-5 py-6 text-center">
            この期間に書いたメモはありません。自分の言葉で一言残すのが「思考放棄しない」第一歩。
          </p>
        ) : (
          <div className="space-y-3">
            {memos.map((e) => (
              <article
                key={e.id}
                className="rounded-xl border border-gray-200 bg-white px-5 py-4"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {e.info && <DomainBadge info={e.info} />}
                  {e.info && (
                    <span className="text-xs font-medium text-gray-900">
                      {e.info.source}
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[e.state.status]}`}
                  >
                    {STATUS_LABELS[e.state.status]}
                  </span>
                  {e.state.updatedAt && (
                    <span
                      className="text-[11px] text-gray-400 ml-auto"
                      title={fullTimestamp(e.state.updatedAt)}
                    >
                      {timeAgo(e.state.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <ArticleLink info={e.info} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-2 border-gray-200 pl-3">
                  {e.state.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
