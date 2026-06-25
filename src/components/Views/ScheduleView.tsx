import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ScheduleView() {
  const { tasks, suggestions, handleAcceptSuggestion, handleRejectSuggestion, handleOptimizeFullWeek } = useApp();

  return (
    <div className="flex-grow grid grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar bg-[#050505]">

      {/* Main Timeline */}
      <div className="col-span-12 lg:col-span-9 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 flex flex-col h-full shadow-lg relative">

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-sans text-xl font-bold text-white tracking-tight uppercase">WEEKLY OPS TIMELINE</h1>
            <p className="font-sans text-xs text-zinc-500 mt-0.5 font-medium">WINDOW: OCT 23 - OCT 29 | STATUS: HIGH DENSITY</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2 font-sans text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all rounded-xl">
              <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
              PREV
            </button>
            <button className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2 font-sans text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all rounded-xl">
              NEXT
              <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="relative bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden rounded-2xl flex-1">

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-800 text-center font-sans text-xs font-semibold">
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-zinc-400 text-sm">schedule</span>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">MON</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 23</p>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">TUE</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 24</p>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-indigo-400 font-bold">WED</p>
                  <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">OCT 25</p>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">THU</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 26</p>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">FRI</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 27</p>
                </div>
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">SAT</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 28</p>
                </div>
                <div className="p-4 bg-zinc-900/10">
                  <p className="tracking-wider text-zinc-400">SUN</p>
                  <p className="text-[10px] text-zinc-500 font-normal mt-0.5">OCT 29</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative custom-scrollbar technical-grid-bg h-[550px] overflow-x-auto">
            <div className="min-w-[800px] h-full relative">

              <div className="absolute left-0 w-full h-0.5 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ top: '240px' }}>
                <div className="absolute -left-1.5 -top-2.5 bg-red-500 text-white px-2 py-0.5 font-mono text-[9px] font-bold rounded-lg">
                  14:42 SCAN
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr]">
                <div className="border-r border-zinc-800 bg-zinc-900/20 text-center text-[10px] font-mono text-zinc-500 select-none">
                  {Array.from({ length: 19 }, (_, i) => {
                    const hr = 6 + i;
                    const hrString = `${String(hr).padStart(2, '0')}:00`;
                    return (
                      <div key={hr} className="h-16 border-b border-zinc-800/20 flex items-center justify-center">
                        {hrString}
                      </div>
                    );
                  })}
                </div>

                <div className="relative h-full grid grid-cols-7">

                  {Array.from({ length: 6 }, (_, idx) => (
                    <div key={idx} className="absolute h-full border-r border-zinc-800/20" style={{ left: `${(idx + 1) * (100 / 7)}%` }}></div>
                  ))}

                  {tasks.filter(t => !t.completed && t.day !== undefined && t.startHour !== undefined).map(task => {
                    const topPx = (task.startHour! - 6) * 64;
                    const heightPx = (task.durationHours || 1.5) * 64;
                    const colWidthPct = 100 / 7;
                    const leftPct = task.day! * colWidthPct;
                    const isCritical = task.id === "critical_exam" || task.type === "EXAM";

                    return (
                      <div
                        key={task.id}
                        className={`absolute p-2.5 border-l-4 z-10 select-none overflow-hidden hover:brightness-110 transition-all rounded-lg ${
                          isCritical
                            ? 'bg-red-500/10 border-red-500 text-red-400'
                            : 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        }`}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `${leftPct}%`,
                          width: `${colWidthPct - 0.2}%`
                        }}
                      >
                        <p className="font-sans text-[10px] font-bold tracking-wider uppercase truncate">
                          {task.name}
                        </p>
                        <p className="font-sans text-[9px] leading-tight text-zinc-400 mt-0.5 truncate">
                          {task.subject}
                        </p>
                      </div>
                    );
                  })}

                  {suggestions.map(sug => {
                    const topPx = (sug.startHour - 6) * 64;
                    const heightPx = sug.durationHours * 64;
                    const colWidthPct = 100 / 7;
                    const leftPct = sug.day * colWidthPct;

                    return (
                      <div
                        key={sug.id}
                        onClick={() => handleAcceptSuggestion(sug)}
                        className="absolute border-2 border-dashed border-zinc-800 bg-zinc-900/10 hover:border-indigo-500/50 p-2.5 z-10 cursor-pointer opacity-60 hover:opacity-100 transition-opacity flex flex-col justify-between rounded-lg"
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `${leftPct}%`,
                          width: `${colWidthPct - 0.2}%`
                        }}
                      >
                        <div>
                          <p className="font-sans text-[9px] font-bold text-zinc-500 tracking-widest uppercase">
                            SUGGESTED
                          </p>
                          <p className="font-sans text-[9px] text-indigo-400 font-semibold mt-0.5 truncate">
                            {sug.title}
                          </p>
                        </div>
                        <span className="font-sans text-[9px] text-indigo-400 text-right block uppercase font-bold">ACCEPT</span>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="col-span-12 lg:col-span-3 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 flex flex-col h-full shadow-lg">
        <div className="mb-6 flex-grow flex flex-col overflow-hidden">
          <h3 className="font-sans text-xs font-bold text-indigo-400 border-b border-zinc-800/60 pb-3 mb-4 flex items-center justify-between">
            AI SUGGESTED SLOTS
            <span className="material-symbols-outlined text-lg text-indigo-400">auto_awesome</span>
          </h3>

          <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {suggestions.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
                <span className="material-symbols-outlined text-zinc-600 text-3xl mb-1">checklist_reveal</span>
                <p className="font-sans text-[10px] text-zinc-500 uppercase font-semibold">ALL SUGGESTIONS INTEGRATED</p>
              </div>
            ) : (
              suggestions.map(sug => (
                <div key={sug.id} className="bg-zinc-950 p-4 border border-zinc-800 hover:border-indigo-500/50 transition-all rounded-2xl relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-sans text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      sug.type === 'HIGH_EFFICIENCY' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {sug.type}
                    </span>
                    <span className="font-sans text-[10px] text-zinc-500 font-bold">{sug.confidence}% CONF</span>
                  </div>
                  <p className="font-sans font-bold text-xs leading-tight text-white">{sug.title}</p>
                  <p className="font-sans text-[10px] text-zinc-500 mt-1">{sug.timeString}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAcceptSuggestion(sug)}
                      className="flex-grow bg-indigo-600 text-white font-sans text-[10px] font-bold py-2 hover:bg-indigo-500 transition-all rounded-xl"
                    >
                      ACCEPT SLOT
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(sug.id)}
                      className="w-9 border border-zinc-800 hover:bg-zinc-900 hover:text-red-400 transition-colors flex items-center justify-center rounded-xl"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-red-950/15 border border-red-900/30 p-4 mb-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-red-400 text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-sans text-[10px] font-bold text-red-400 tracking-wider">SURGE WARNING</span>
            </div>
            <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
              System predicts 85% burnout probability for THU based on current load. Suggest redistributing "Research" task.
            </p>
          </div>

          <button
            onClick={handleOptimizeFullWeek}
            className="w-full bg-zinc-950 border border-zinc-800 py-3.5 font-sans text-xs font-bold text-zinc-300 tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all rounded-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-base text-indigo-400">rocket_launch</span>
            OPTIMIZE FULL WEEK
          </button>
        </div>
      </aside>

    </div>
  );
}
