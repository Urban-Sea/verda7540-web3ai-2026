import DailyNote from "@/components/DailyNote";
import HeaderControls from "@/components/HeaderControls";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/85">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white dark:text-black text-xs font-black tracking-tight">
                CA
              </span>
            </div>
            <div className="border-l border-gray-300 dark:border-gray-700 pl-3 min-w-0">
              <h1 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none truncate">
                CatchUp AI <span className="text-gray-400 font-light">v6</span>
              </h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase truncate">
                Layered Intelligence Brief
              </p>
            </div>
          </div>
          <HeaderControls />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <DailyNote />
      </main>

      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <p className="text-xs text-gray-400">
            CatchUp AI — VPC v6 (Dark / Keyboard / Polish)
          </p>
          <p className="text-xs text-gray-400">
            G1: Catchup × 領域マップ + G2: Think for yourself
          </p>
        </div>
      </footer>
    </div>
  );
}
