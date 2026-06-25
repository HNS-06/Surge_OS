import { useApp } from "../../context/AppContext";

export default function SurgeView() {
  const {
    activeSession,
    setActiveSession,
    activeBreakoutStepIndex,
    setActiveBreakoutStepIndex,
    handleToggleSubtask,
    triggerSessionCompletion,
    hrValue,
    setHrValue,
    effValue,
    setEffValue,
    formatTimer,
    currentTab,
  } = useApp();

  if (!activeSession || currentTab !== "surge") return null;

  const currentIncomp = activeSession.subtasks.find(s => !s.completed);

  return (
    <div className="flex-grow flex flex-col p-6 overflow-hidden h-full bg-[#050505]">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2 font-sans">
          <span className="text-sm font-bold text-red-400 tracking-wider">ACTIVE MISSION SPRINT</span>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 font-medium truncate max-w-sm">{activeSession.taskName}</span>
        </div>
        <div className="font-sans text-[10px] text-zinc-500 font-semibold tracking-wider">
          SESSION: {Math.round((activeSession.totalTime - activeSession.timeRemaining) / 60)}M / {Math.round(activeSession.totalTime / 60)}M
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex flex-col relative h-full overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-5 border-b border-zinc-800/60 pb-3">
              <h3 className="font-sans text-xs font-bold text-zinc-400 tracking-widest">SURVIVAL PLAN</h3>
              <span className="font-sans text-[9px] text-red-400 font-bold tracking-widest uppercase">[ PRIORITY: CRITICAL ]</span>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1">
              {activeSession.subtasks.map((st, index) => {
                const isActive = activeBreakoutStepIndex === -1 ? index === 0 : index === activeBreakoutStepIndex;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`flex items-center gap-3.5 p-3.5 border rounded-2xl group cursor-pointer transition-all ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/5 text-white shadow-lg'
                        : st.completed
                          ? 'border-zinc-800/30 opacity-50 bg-zinc-950/20'
                          : 'border-zinc-800/80 text-zinc-300 hover:bg-zinc-950 bg-zinc-950/40'
                    }`}
                  >
                    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-lg shrink-0 transition-all ${
                      st.completed
                        ? 'bg-indigo-500 border-indigo-500'
                        : isActive
                          ? 'border-amber-500'
                          : 'border-zinc-800'
                    }`}>
                      {st.completed && (
                        <span className="material-symbols-outlined text-[13px] text-white font-bold">check</span>
                      )}
                    </div>
                    <span className={`font-sans text-xs flex-grow font-semibold ${st.completed ? 'line-through text-zinc-600' : ''}`}>
                      {index + 1}. {st.name}
                    </span>
                    <span className="font-sans text-[10px] text-zinc-500 font-bold">[ {st.minutes} MIN ]</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/60 space-y-4">
              <div>
                <div className="flex justify-between font-sans text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">
                  <span>TIME REMAINING</span>
                  <span className="text-amber-500 font-mono font-semibold">{Math.round(activeSession.timeRemaining / 60)}m</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(activeSession.timeRemaining / activeSession.totalTime) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-sans text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">
                  <span>TIME ESTIMATED NEEDED</span>
                  <span className="text-red-400 font-mono font-semibold">55m</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-full relative overflow-visible">
                  <div className="h-full bg-red-500 rounded-full w-full"></div>
                  <div className="absolute top-0 right-[-20%] h-full w-[20%] bg-red-500/30 border-r-2 border-red-500 animate-pulse rounded-r-full"></div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 font-sans text-xs flex items-center gap-2 rounded-2xl">
                <span className="material-symbols-outlined text-sm font-bold">warning</span>
                CRITICAL DEFICIT: -11 MINUTES DETECTED
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex-1 border-2 border-amber-500/20 bg-zinc-900 p-8 flex flex-col justify-center items-center relative overflow-hidden rounded-[2rem] h-full shadow-lg">
            <div className="absolute top-4 right-4 font-sans text-[10px] text-zinc-600 font-semibold uppercase">SESSION: 99x ALPHA</div>

            <div className="text-center max-w-xl mx-auto flex flex-col items-center">
              <span className="font-sans text-xs font-bold text-amber-500 tracking-[0.4em] mb-4 uppercase">CURRENT OBJECTIVE</span>
              <h2 className="font-sans text-xl font-extrabold text-white mb-4 uppercase">
                EXECUTE: {currentIncomp?.name || "SURVIVAL PLAN"}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8 font-medium">
                Total immersion required. Block all external stimuli. Focus strictly on the current subtask. Do not edit until the surge clears.
              </p>

              <div className="w-full h-1 bg-zinc-950 relative mb-8 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-full" style={{ width: '35%' }}></div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (currentIncomp) {
                      handleToggleSubtask(currentIncomp.id);
                    } else {
                      triggerSessionCompletion(activeSession);
                    }
                  }}
                  className="bg-amber-500 text-zinc-950 px-8 py-3.5 font-sans text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all rounded-xl tracking-wider uppercase"
                >
                  MARK AS COMPLETE
                </button>
                <button
                  onClick={() => triggerSessionCompletion(activeSession)}
                  className="border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white px-8 py-3.5 font-sans text-xs font-bold transition-all rounded-xl uppercase"
                >
                  FORCE FINISH SESSION
                </button>
              </div>
            </div>
          </div>

          <div className="h-[145px] bg-zinc-900 border border-zinc-800 p-4 flex gap-6 rounded-[2rem] shadow-lg">
            <div className="w-28 flex flex-col items-center justify-center border-r border-zinc-800 pr-4 select-none">
              <span className="font-sans text-[9px] font-bold text-indigo-400 tracking-widest uppercase mb-1">BLOCK TYPE</span>
              <div className="text-indigo-400 font-sans text-lg font-bold">{activeSession.blockType || "FEAR"}</div>
              <span className="material-symbols-outlined text-indigo-400 text-xl mt-1">cloud</span>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <h4 className="font-sans font-bold text-xs text-white mb-1 uppercase tracking-wide">
                {activeSession.systemDiagnosis}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-md font-medium">
                Paralysis threshold flagged. Task complexity or perfectionism triggers avoidant flight response. Launch the breakout intervention now.
              </p>
            </div>

            <div className="w-64 flex flex-col justify-center border-l border-zinc-800 pl-6 h-full select-none">
              <span className="font-sans text-[9px] font-bold text-amber-500 tracking-wider block uppercase mb-1">RECOMMENDED ACTION</span>
              <p className="font-sans text-[10px] text-white font-semibold leading-tight mb-2 truncate">
                "{activeSession.intervention}"
              </p>
              <button
                onClick={() => {
                  if (activeBreakoutStepIndex === -1) {
                    setActiveBreakoutStepIndex(0);
                  } else {
                    const nextIdx = (activeBreakoutStepIndex + 1) % activeSession.subtasks.length;
                    setActiveBreakoutStepIndex(nextIdx);
                  }
                }}
                className="w-full bg-zinc-950 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 py-2 rounded-xl font-sans text-[10px] font-bold tracking-wider transition-all active:scale-[0.98]"
              >
                {activeBreakoutStepIndex === -1 ? "INITIALIZE BREAKOUT" : "NEXT BREAKOUT STEP"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-950 border border-zinc-800 p-3 relative rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-1.5">
            <span className="material-symbols-outlined text-sm font-bold animate-pulse">timer</span>
            <span className="font-sans text-[10px] font-bold tracking-wider uppercase">TIMER ACTIVE</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-sans text-xs select-none">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Current Pace</span>
              <span className="text-amber-500 font-mono font-semibold">{effValue}% EFFICIENCY</span>
            </div>
            <div className="w-px h-6 bg-zinc-800"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Biometrics</span>
              <span className="text-indigo-400 font-mono font-semibold">HEART: {hrValue}BPM</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setHrValue(110);
              setEffValue(64);
              alert("Panic override initiated. Intervention buffer extended. Maintain deep focus!");
            }}
            className="bg-red-500/20 border border-red-500 text-red-400 px-5 py-2 font-sans text-[10px] font-bold tracking-wider rounded-xl hover:bg-red-500/30 active:scale-95 transition-all flex items-center gap-1.5 uppercase animate-pulse"
          >
            <span className="material-symbols-outlined text-xs font-bold">warning</span>
            I'M FALLING BEHIND
          </button>
          <button
            disabled
            className="bg-zinc-900 text-zinc-600 border border-zinc-800 px-5 py-2 font-sans text-[10px] font-bold tracking-wider rounded-xl cursor-not-allowed uppercase"
          >
            EXIT SURGE [LOCKED]
          </button>
        </div>
      </footer>
    </div>
  );
}
