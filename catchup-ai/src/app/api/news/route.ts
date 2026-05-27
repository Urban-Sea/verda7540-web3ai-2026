import { fetchAllNews } from "@/lib/fetchNews";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const articles = await fetchAllNews();
    return NextResponse.json({ articles, fetchedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { articles: [], fetchedAt: new Date().toISOString(), error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
