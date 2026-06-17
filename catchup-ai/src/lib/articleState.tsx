"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Article, ArticleSnapshot, ArticleState } from "./types";

const KEY_PREFIX = "catchup-ai-article-";
const DEFAULT_STATE: ArticleState = {
  comment: "",
  status: "unread",
  action: "none",
};

type StatesMap = Record<string, ArticleState>;

interface ArticleStatesContextValue {
  loaded: boolean;
  states: StatesMap;
  getState: (id: string) => ArticleState;
  update: (
    id: string,
    patch: Partial<ArticleState>,
    snapshot?: ArticleSnapshot
  ) => void;
}

const ArticleStatesContext = createContext<ArticleStatesContextValue | null>(
  null
);

export function ArticleStatesProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<StatesMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const next: StatesMap = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(KEY_PREFIX)) continue;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          next[key.slice(KEY_PREFIX.length)] = {
            ...DEFAULT_STATE,
            ...JSON.parse(raw),
          };
        }
      } catch {
        // corrupted entry — ignore and fall back to default
      }
    }
    setStates(next);
    setLoaded(true);
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<ArticleState>, snapshot?: ArticleSnapshot) => {
      setStates((prev) => {
        const merged: ArticleState = {
          ...(prev[id] ?? DEFAULT_STATE),
          ...patch,
          ...(snapshot ? { snapshot } : {}),
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(KEY_PREFIX + id, JSON.stringify(merged));
        } catch {
          // storage full / unavailable — keep in-memory state anyway
        }
        return { ...prev, [id]: merged };
      });
    },
    []
  );

  const getState = useCallback(
    (id: string) => states[id] ?? DEFAULT_STATE,
    [states]
  );

  return (
    <ArticleStatesContext.Provider value={{ loaded, states, getState, update }}>
      {children}
    </ArticleStatesContext.Provider>
  );
}

export function useArticleStates(): ArticleStatesContextValue {
  const ctx = useContext(ArticleStatesContext);
  if (!ctx) {
    throw new Error(
      "useArticleStates must be used within an ArticleStatesProvider"
    );
  }
  return ctx;
}

const STATUS_CYCLE: ArticleState["status"][] = [
  "unread",
  "read",
  "understood",
];

const ACTION_CYCLE: ArticleState["action"][] = ["none", "todo", "done"];

export function useArticleState(article: Article) {
  const { getState, update } = useArticleStates();
  const id = article.id;
  const state = getState(id);

  // 操作のたびに最新メタを焼き付けて、振り返りビューで参照できるようにする
  const snapshot = useMemo<ArticleSnapshot>(
    () => ({
      title: article.title,
      titleJa: article.titleJa,
      url: article.url,
      source: article.source,
      domain: article.domain,
      publishedAt: article.publishedAt,
    }),
    [
      article.title,
      article.titleJa,
      article.url,
      article.source,
      article.domain,
      article.publishedAt,
    ]
  );

  const setComment = useCallback(
    (comment: string) => update(id, { comment }, snapshot),
    [id, update, snapshot]
  );

  const cycleStatus = useCallback(() => {
    const idx = STATUS_CYCLE.indexOf(state.status);
    update(
      id,
      { status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] },
      snapshot
    );
  }, [id, state.status, update, snapshot]);

  const cycleAction = useCallback(() => {
    const idx = ACTION_CYCLE.indexOf(state.action);
    update(
      id,
      { action: ACTION_CYCLE[(idx + 1) % ACTION_CYCLE.length] },
      snapshot
    );
  }, [id, state.action, update, snapshot]);

  return { state, setComment, cycleStatus, cycleAction };
}
