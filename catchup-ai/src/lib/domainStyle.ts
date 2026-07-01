import { Domain } from "./types";

export const DOMAIN_STYLE: Record<
  Domain,
  {
    badge: string;
    dot: string;
    accent: string;
    laneHeader: string;
  }
> = {
  models: {
    badge:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30",
    dot: "bg-blue-500",
    accent: "border-blue-500 dark:border-blue-500/60",
    laneHeader: "text-blue-600 dark:text-blue-400",
  },
  agents: {
    badge:
      "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
    dot: "bg-violet-500",
    accent: "border-violet-500 dark:border-violet-500/60",
    laneHeader: "text-violet-600 dark:text-violet-400",
  },
  safety: {
    badge:
      "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
    accent: "border-red-500 dark:border-red-500/60",
    laneHeader: "text-red-600 dark:text-red-400",
  },
  policy: {
    badge:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    dot: "bg-amber-500",
    accent: "border-amber-500 dark:border-amber-500/60",
    laneHeader: "text-amber-600 dark:text-amber-400",
  },
  infra: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
    accent: "border-emerald-500 dark:border-emerald-500/60",
    laneHeader: "text-emerald-600 dark:text-emerald-400",
  },
  industry: {
    badge:
      "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30",
    dot: "bg-slate-500",
    accent: "border-slate-500 dark:border-slate-500/60",
    laneHeader: "text-slate-600 dark:text-slate-300",
  },
};
