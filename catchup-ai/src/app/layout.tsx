import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CatchUp AI - Daily Intelligence Brief",
  description:
    "AI ニュースを自動収集・優先度分類して、デイリーノート形式で届けるアプリ。思考放棄せず、自分の言葉でメモを残そう。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
  ],
};

// 初回ペイント前にテーマを確定させてチラつき（FOUC）を防ぐ。
// localStorage の明示指定 > OS 設定 の優先順。
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('catchup-ai-theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (dark) root.classList.add('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="text-gray-900 dark:text-gray-100">{children}</body>
    </html>
  );
}
