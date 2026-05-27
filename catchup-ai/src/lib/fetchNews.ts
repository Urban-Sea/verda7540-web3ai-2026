import RSSParser from "rss-parser";
import translate from "google-translate-api-x";
import { Article } from "./types";

const RSS_FEEDS = [
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    source: "TechCrunch",
  },
  {
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    source: "The Verge",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    source: "Ars Technica",
  },
];

const HIGH_PRIORITY_KEYWORDS = [
  "gpt",
  "claude",
  "openai",
  "anthropic",
  "gemini",
  "llm",
  "foundation model",
  "breakthrough",
  "launch",
  "release",
  "open source",
];

const MEDIUM_PRIORITY_KEYWORDS = [
  "ai",
  "machine learning",
  "deep learning",
  "neural",
  "transformer",
  "training",
  "model",
  "agent",
  "reasoning",
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function determinePriority(
  title: string,
  summary: string
): "high" | "medium" | "low" {
  const text = `${title} ${summary}`.toLowerCase();
  if (HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw))) return "high";
  if (MEDIUM_PRIORITY_KEYWORDS.some((kw) => text.includes(kw)))
    return "medium";
  return "low";
}

function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const allKeywords = [...HIGH_PRIORITY_KEYWORDS, ...MEDIUM_PRIORITY_KEYWORDS];
  return [...new Set(allKeywords.filter((kw) => text.includes(kw)))].slice(
    0,
    4
  );
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function translateToJa(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await translate(text, { from: "en", to: "ja" });
    return res.text;
  } catch {
    return text;
  }
}

export async function fetchAllNews(): Promise<Article[]> {
  const parser = new RSSParser();
  const allArticles: Omit<Article, "titleJa" | "summaryJa">[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.slice(0, 10).map((item) => {
        const title = item.title || "Untitled";
        const rawSummary =
          item.contentSnippet || item.content || item.summary || "";
        const summary = stripHtml(rawSummary).slice(0, 300);
        return {
          id: hashString(item.link || item.title || Math.random().toString()),
          title,
          summary,
          url: item.link || "",
          source: feed.source,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          priority: determinePriority(title, summary),
          tags: extractTags(title, summary),
        };
      });
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  allArticles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  allArticles.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const top = allArticles.slice(0, 20);

  const translated = await Promise.all(
    top.map(async (article) => {
      const [titleJa, summaryJa] = await Promise.all([
        translateToJa(article.title),
        translateToJa(article.summary),
      ]);
      return { ...article, titleJa, summaryJa } satisfies Article;
    })
  );

  return translated;
}
