import DailyNote from "@/components/DailyNote";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tight">
                CA
              </span>
            </div>
            <div className="border-l border-gray-300 pl-3">
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                CatchUp AI <span className="text-gray-400 font-light">v3</span>
              </h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                Layered Intelligence Brief
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-mono tracking-wider">
              LIVE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <DailyNote />
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="text-xs text-gray-400">CatchUp AI — VPC v3 (Layered)</p>
          <p className="text-xs text-gray-400">
            G1: Catchup × 領域マップ + G2: Think for yourself
          </p>
        </div>
      </footer>
    </div>
  );
}
