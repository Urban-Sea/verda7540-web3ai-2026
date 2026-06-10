export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 0) return "たった今";
  if (diffSec < 60) return "たった今";

  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}分前`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}日前`;

  return new Date(iso).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export function fullTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
