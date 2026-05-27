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
  tags: string[];
}

export interface ArticleState {
  comment: string;
  status: "unread" | "read" | "understood";
}
