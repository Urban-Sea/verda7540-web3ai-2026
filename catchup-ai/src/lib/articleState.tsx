"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ArticleState } from "./types";

const KEY_PREFIX = "catchup-ai-article-";
const DEFAULT_STATE: ArticleState = { comment: "", status: "unread" };

type StatesMap = Record<string, ArticleState>;

interface ArticleStatesContextValue {
  loaded: boolean;
  states: StatesMap;
  getState: (id: string) => ArticleState;
  update: (id: string, patch: Partial<ArticleState>) => void;
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

  const update = useCallback((id: string, patch: Partial<ArticleState>) => {
    setStates((prev) => {
      const merged = { ...(prev[id] ?? DEFAULT_STATE), ...patch };
      try {
        localStorage.setItem(KEY_PREFIX + id, JSON.stringify(merged));
      } catch {
        // storage full / unavailable — keep in-memory state anyway
      }
      return { ...prev, [id]: merged };
    });
  }, []);

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

export function useArticleState(id: string) {
  const { getState, update } = useArticleStates();
  const state = getState(id);

  const setComment = useCallback(
    (comment: string) => update(id, { comment }),
    [id, update]
  );

  const cycleStatus = useCallback(() => {
    const idx = STATUS_CYCLE.indexOf(state.status);
    update(id, { status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] });
  }, [id, state.status, update]);

  return { state, setComment, cycleStatus };
}
