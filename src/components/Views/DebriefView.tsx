import React from 'react';
import { useApp } from '../../context/AppContext';

export default function DebriefView() {
  const { debriefData, isCopied, handleExportSessionData, handleCopySessionData, setCurrentTab } = useApp();

  if (!debriefData) return null;

  return (
    <div className="flex-grow p-6 overflow-y-auto custom-scrollbar h-full bg-[#050505]">
      <div className="max-w-7xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[2rem] min-h-[580px] flex flex-col relative overflow-hidden shadow-lg">

        <header className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-xl font-bold text-white tracking-tight uppercase">SESSION DEBRIEF</h1>
            <p className="font-sans text-xs text-zinc-500 uppercase tracking-wider mt-1 font-semibold">
              MISSION DATE: {debriefData.missionDate} // DURATION: {debriefData.durationString}
            </p>
          </div>
          <div className="hidden sm:block font-sans text-xs text-indigo-400 font-bold tracking-wider uppercase">
            STATUS: ANALYZING POST MORTEM
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12">
          <div className="col-span-12 lg:col-span-8 border-r border-zinc-800/80 flex flex-col">

            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-zinc-800/80 font-sans select-none">
              <div className="p-6 border-r border-zinc-800/80 bg-zinc-950/20">
                <span className="text-[10px] text-zinc-500 block mb-2 uppercase font-bold tracking-wider">Tasks Completed</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{debriefData.tasksCompleted}</span>
                  <span className="text-xs text-zinc-400 font-bold">{debriefData.completionRate}%</span>
                </div>
              </div>

              <div className="p-6 border-r border-zinc-800/80 bg-zinc-950/20">
                <span className="text-[10px] text-zinc-500 block mb-2 uppercase font-bold tracking-wider">Time Accuracy</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-500">{debriefData.timeAccuracy}%</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase">{debriefData.timeAccuracyLabel}</span>
                </div>
              </div>

              <div className="p-6 bg-red-500/[0.02]">
                <span className="text-[10px] text-zinc-500 block mb-2 uppercase font-bold tracking-wider">Block Type</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-red-400 shadow-[0_0_8px_#f87171] rounded-full animate-pulse"></div>
                  <span className="text-3xl font-extrabold text-red-400">{debriefData.blockType}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <h2 className="font-sans text-xs font-bold text-zinc-400 mb-6 flex items-center gap-2 tracking-wider">
                <span className="material-symbols-outlined text-base text-indigo-400">history</span>
                WHAT HAPPENED
              </h2>

              <div className="space-y-4 relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-800"></div>

                {debriefData.timeline.map((item: any) => (
                  <div key={item.id} className="relative pl-9 group">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center z-10 shadow-sm">
                      {item.status === 'completed' ? (
                        <span className="material-symbols-outlined text-xs text-emerald-400 font-bold">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs text-zinc-600 font-bold">close</span>
                      )}
                    </div>

                    <div className={`border p-4 bg-zinc-950/40 rounded-2xl transition-all ${item.status === 'completed' ? 'border-zinc-800 hover:border-indigo-500/40' : 'border-dashed border-zinc-800/60 opacity-60'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-sans font-bold text-sm text-white">{item.title}</h3>
                        {item.durationString && (
                          <span className="font-sans text-xs text-emerald-400 font-bold">[ {item.durationString} ]</span>
                        )}
                        {item.status === 'skipped' && (
                          <span className="font-sans text-xs text-zinc-500 font-bold">[ SKIPPED ]</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-medium">{item.description}</p>

                      {item.reason && (
                        <div className="inline-block mt-3 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-sans text-zinc-400 uppercase tracking-wider font-semibold">
                          REASON: {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <aside className="col-span-12 lg:col-span-4 p-6 flex flex-col gap-6 h-full bg-zinc-950/20">
            <div className="border border-zinc-800/80 bg-zinc-900/50 p-5 flex-1 flex flex-col rounded-2xl shadow-sm">
              <h2 className="font-sans text-xs font-bold text-indigo-400 mb-4 flex items-center gap-2 tracking-wider uppercase">
                <span className="material-symbols-outlined text-base">psychology</span>
                PATTERN INTEL
              </h2>

              <div className="flex-1 space-y-6">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl font-sans text-xs leading-relaxed text-indigo-400 font-medium">
                  <span className="font-bold">SYSTEM REPORT:</span> {debriefData.systemLog}
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider block">BLOCK DISTRIBUTION</span>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-400 font-medium">
                        <span>FOG</span>
                        <span>{debriefData.fogPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${debriefData.fogPct}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-red-400 font-medium">
                        <span>FEAR</span>
                        <span>{debriefData.fearPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full shadow-[0_0_4px_#f87171]" style={{ width: `${debriefData.fearPct}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-amber-500 font-medium">
                        <span>FRICTION</span>
                        <span>{debriefData.frictionPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${debriefData.frictionPct}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-indigo-400 font-medium">
                        <span>FAKE</span>
                        <span>{debriefData.fakePct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${debriefData.fakePct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-800 bg-zinc-950/60 h-28 flex items-center justify-center rounded-2xl shadow-inner p-4 text-center">
                  <span className="font-sans text-[10px] text-indigo-400 font-bold tracking-wider animate-pulse uppercase">
                    RECALIBRATING SURGE THRESHOLD...
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-4 bg-zinc-950/40">
          <button
            onClick={() => setCurrentTab("overview")}
            className="w-full sm:w-auto px-6 py-3 font-sans text-xs font-bold text-zinc-400 hover:text-white transition-colors rounded-xl uppercase tracking-wider"
          >
            BACK TO DASHBOARD
          </button>
          <button
            id="export-session-data-btn"
            onClick={handleExportSessionData}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider shadow-sm"
          >
            <span className="material-symbols-outlined text-sm font-bold">download</span>
            EXPORT SESSION DATA
          </button>
          <button
            id="copy-session-data-btn"
            onClick={handleCopySessionData}
            className={`w-full sm:w-auto px-6 py-3 font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider shadow-sm ${
              isCopied
                ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isCopied ? 'check' : 'content_copy'}
            </span>
            {isCopied ? 'COPIED!' : 'COPY TO CLIPBOARD'}
          </button>
          <button
            onClick={() => setCurrentTab("schedule")}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-sans text-xs font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider shadow-lg"
          >
            SCHEDULE REMAINING TASKS
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
