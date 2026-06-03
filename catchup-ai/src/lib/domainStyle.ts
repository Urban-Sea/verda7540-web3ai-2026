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
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
    accent: "border-blue-500",
    laneHeader: "text-blue-600",
  },
  agents: {
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-500",
    accent: "border-violet-500",
    laneHeader: "text-violet-600",
  },
  safety: {
    badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
    accent: "border-red-500",
    laneHeader: "text-red-600",
  },
  policy: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
    accent: "border-amber-500",
    laneHeader: "text-amber-600",
  },
  infra: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    accent: "border-emerald-500",
    laneHeader: "text-emerald-600",
  },
  industry: {
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dot: "bg-slate-500",
    accent: "border-slate-500",
    laneHeader: "text-slate-600",
  },
};
