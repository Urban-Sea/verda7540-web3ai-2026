export type Domain =
  | "models"
  | "agents"
  | "safety"
  | "policy"
  | "infra"
  | "industry";

export interface Article {
  id: string;
  title: string;
  titleJa: string;
  summary: string;
  summaryJa: string;
  url: string;
  source: string;
  publishedAt: string;
  priority: "high" | "medium" | "low";
  domain: Domain;
  tags: string[];
}

export const DOMAIN_META: Record<
  Domain,
  { label: string; ja: string; description: string }
> = {
  models: {
    label: "Models",
    ja: "基盤モデル",
    description: "Foundation models, releases, architectures",
  },
  agents: {
    label: "Agents",
    ja: "エージェント",
    description: "Autonomous agents, tool use, MCP",
  },
  safety: {
    label: "Safety",
    ja: "安全性・セキュリティ",
    description: "Alignment, jailbreak, vulnerabilities, risk",
  },
  policy: {
    label: "Policy",
    ja: "規制・政策",
    description: "Regulation, law, government, lawsuits",
  },
  infra: {
    label: "Infra",
    ja: "インフラ・半導体",
    description: "GPU, chips, datacenters, compute",
  },
  industry: {
    label: "Industry",
    ja: "業界・ビジネス",
    description: "Funding, M&A, business moves",
  },
};

// 記事がフィードから流れて消えても振り返れるよう、操作時にメタを焼き付けておく
export interface ArticleSnapshot {
  title: string;
  titleJa: string;
  url: string;
  source: string;
  domain: Domain;
  publishedAt: string;
}

export interface ArticleState {
  comment: string;
  status: "unread" | "read" | "understood";
  // VPC #9「行動に変換する導線」: なし → 試す → やった
  action: "none" | "todo" | "done";
  snapshot?: ArticleSnapshot;
  updatedAt?: string;
}
