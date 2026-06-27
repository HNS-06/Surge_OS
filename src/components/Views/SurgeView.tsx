import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from "../../context/AppContext";
import { sfxPanic } from "../../utils/soundEngine";

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
    showToast,
  } = useApp();

  const [exitClickCount, setExitClickCount] = useState(0);
  const exitResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up exit-reset timer on unmount
  useEffect(() => {
    return () => {
      if (exitResetTimerRef.current) clearTimeout(exitResetTimerRef.current);
    };
  }, []);

  // Boot sequence states, refs & effect
  const [isBooting, setIsBooting] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  // bootedSessionRef: set only when boot COMPLETES successfully (inside finishTimer).
  // Never set at effect start — this is deliberate so StrictMode cleanup + remount
  // can re-run the full boot sequence instead of skipping it.
  const bootedSessionRef = useRef<string | null>(null);
  // initiatedRef: set when the effect starts, reset in cleanup.
  // Prevents the effect body from running twice on the same mount
  // (e.g. if the dep somehow re-fires before finishTimer completes).
  const initiatedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeSession) return;
    // Already finished booting for this session — skip
    if (bootedSessionRef.current === activeSession.taskId) return;
    // Already started boot on this mount — skip (prevents double-start within same mount)
    if (initiatedRef.current === activeSession.taskId) return;

    initiatedRef.current = activeSession.taskId;
    setIsBooting(true);
    setIsFading(false);
    setVisibleLines(1);

    const t2 = setTimeout(() => setVisibleLines(2), 600);
    const t3 = setTimeout(() => setVisibleLines(3), 1100);
    const t4 = setTimeout(() => setVisibleLines(4), 1600);
    const t5 = setTimeout(() => setVisibleLines(5), 2000);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2200);

    const finishTimer = setTimeout(() => {
      // Write bootedSessionRef ONLY here — on successful completion.
      // If cleanup fires before this runs (StrictMode unmount), bootedSessionRef
      // stays null so the remounted component re-runs boot correctly.
      bootedSessionRef.current = activeSession.taskId;
      setIsBooting(false);
      setIsFading(false);
      setVisibleLines(0);
    }, 2500);

    return () => {
      // Reset initiatedRef so that if StrictMode remounts with the same taskId,
      // the effect body is allowed to run again (boot wasn't completed yet).
      initiatedRef.current = null;
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [activeSession?.taskId]);


  const currentIncomp = activeSession ? activeSession.subtasks.find(s => !s.completed) : undefined;
  const allSubtasksCompleted = activeSession ? activeSession.subtasks.every(s => s.completed) : false;

  // Celebration overlay state & effect
  const [showCelebration, setShowCelebration] = useState(false);
  const celebratedTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeSession && allSubtasksCompleted && celebratedTaskIdRef.current !== activeSession.taskId) {
      setShowCelebration(true);
      celebratedTaskIdRef.current = activeSession.taskId;

      const timer = setTimeout(() => {
        setShowCelebration(false);
        triggerSessionCompletion(activeSession);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [allSubtasksCompleted, activeSession?.taskId]);

  const handleProceedToDebrief = () => {
    setShowCelebration(false);
    triggerSessionCompletion(activeSession!);
  };

  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 360) / 12;
      const rad = (angle * Math.PI) / 180;
      const velocity = 80 + Math.random() * 80;
      const dx = `${Math.cos(rad) * velocity}px`;
      const dy = `${Math.sin(rad) * velocity}px`;
      const colors = ['bg-indigo-400', 'bg-amber-400', 'bg-emerald-400'];
      const color = colors[i % colors.length];
      const delay = `${Math.random() * 0.2}s`;
      return { id: i, dx, dy, color, delay };
    });
  }, []);

  // Single source of truth: isBooting drives the portal.
  // The fallback arm covers the 1-render gap before the effect fires on first mount
  // (before isBooting has been set to true by the effect).
  // Since bootedSessionRef is now only written on COMPLETION, this arm correctly
  // shows the portal during that first render without creating a deadlock.
  const shouldShowBoot = isBooting || (!!activeSession && bootedSessionRef.current !== activeSession.taskId && initiatedRef.current !== activeSession.taskId);

  // Boot portal — renders to document.body, escaping all stacking contexts
  if (shouldShowBoot) {
    return ReactDOM.createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          background: '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isFading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
        className="font-mono text-xs text-zinc-400 select-none"
      >
        <div className="w-full max-w-md px-6 space-y-2.5">
          {visibleLines >= 1 && (
            <div className="animate-pulse">&gt; INITIALIZING SURGE PROTOCOL...</div>
          )}
          {visibleLines >= 2 && (
            <div>&gt; LOADING COGNITIVE OVERRIDE STACK...</div>
          )}
          {visibleLines >= 3 && (
            <div className="text-indigo-400">&gt; BIOMETRIC SYNC: ACTIVE</div>
          )}
          {visibleLines >= 4 && (
            <div className="text-red-500 font-bold">&gt; THREAT LEVEL: CRITICAL</div>
          )}
          {visibleLines >= 5 && (
            <div className="text-amber-500 text-lg font-extrabold tracking-widest text-center mt-6 uppercase animate-bounce">
              [ SURGE ACTIVE ]
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  if (!activeSession || currentTab !== "surge") return null;

  const handleExitSurge = () => {
    if (allSubtasksCompleted) {
      triggerSessionCompletion(activeSession);
      return;
    }
    if (exitClickCount === 0) {
      setExitClickCount(1);
      showToast("Click EXIT SURGE again to confirm early exit", "info");
      if (exitResetTimerRef.current) clearTimeout(exitResetTimerRef.current);
      exitResetTimerRef.current = setTimeout(() => setExitClickCount(0), 3000);
    } else {
      triggerSessionCompletion(activeSession);
    }
  };

  const progressPct = Math.round(((activeSession.totalTime - activeSession.timeRemaining) / activeSession.totalTime) * 100);

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
                  <span>SESSION PROGRESS</span>
                  <span className="text-indigo-400 font-mono font-semibold">{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-full relative overflow-visible">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                </div>
              </div>

              {activeSession.timeRemaining <= 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 font-sans text-xs flex items-center gap-2 rounded-2xl">
                  <span className="material-symbols-outlined text-sm font-bold">warning</span>
                  SESSION TIME EXHAUSTED
                </div>
              )}
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
                <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
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
                  className="bg-amber-500 text-zinc-950 px-8 py-3.5 font-sans text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all rounded-xl tracking-wider uppercase cursor-pointer"
                >
                  MARK AS COMPLETE
                </button>
                <button
                  onClick={() => triggerSessionCompletion(activeSession)}
                  className="border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white px-8 py-3.5 font-sans text-xs font-bold transition-all rounded-xl uppercase cursor-pointer"
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
                className="w-full bg-zinc-950 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 py-2 rounded-xl font-sans text-[10px] font-bold tracking-wider transition-all active:scale-[0.98] cursor-pointer"
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
              <div className="flex items-center gap-2 mt-1 select-none">
                <svg width="120" height="40" viewBox="0 0 120 40" className="overflow-hidden bg-zinc-950/20 border border-zinc-800/40 rounded-lg">
                  <g
                    className="ecg-scroller"
                    style={{
                      animation: 'ecgScroll linear infinite',
                      animationDuration: `${hrValue > 100 ? 1.0 : 2.0}s`,
                    }}
                  >
                    <path
                      d="M 0 20 L 20 20 Q 25 15 30 20 L 35 20 L 40 24 L 45 4 L 50 36 L 55 20 L 65 20 Q 75 10 85 20 L 120 20 M 120 20 L 140 20 Q 145 15 150 20 L 155 20 L 160 24 L 165 4 L 170 36 L 175 20 L 185 20 Q 195 10 205 20 L 240 20"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
                <span className="text-indigo-400 font-mono font-semibold text-xs">{hrValue} BPM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              sfxPanic();
              setHrValue(110);
              setEffValue(64);
              showToast("Panic override initiated. Intervention buffer extended. Maintain deep focus!", "info");
            }}
            className="bg-red-500/20 border border-red-500 text-red-400 px-5 py-2 font-sans text-[10px] font-bold tracking-wider rounded-xl hover:bg-red-500/30 active:scale-95 transition-all flex items-center gap-1.5 uppercase animate-pulse cursor-pointer"
            title="Panic override"
          >
            <span className="material-symbols-outlined text-xs font-bold">warning</span>
            I'M FALLING BEHIND
          </button>
          <button
            onClick={handleExitSurge}
            disabled={false}
            className={`px-5 py-2 font-sans text-[10px] font-bold tracking-wider rounded-xl transition-all uppercase cursor-pointer ${
              allSubtasksCompleted || exitClickCount > 0
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
            }`}
            title="Exit surge session"
          >
            {allSubtasksCompleted ? 'EXIT SURGE' : exitClickCount > 0 ? 'CONFIRM EXIT?' : 'EXIT SURGE [LOCKED]'}
          </button>
        </div>
      </footer>

      {showCelebration && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="select-none animate-[fadeIn_0.3s_ease-out]"
        >
          <div className="relative flex flex-col items-center text-center p-8 max-w-md">

            {/* Particle Burst Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    '--dx': p.dx,
                    '--dy': p.dy,
                    animationName: 'particleRadial',
                    animationDuration: '0.8s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: p.delay,
                    backgroundColor: p.color === 'bg-indigo-400' ? '#818cf8' : p.color === 'bg-amber-400' ? '#fbbf24' : '#34d399'
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Large checkmark scale-in */}
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-[scaleIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
              <span className="material-symbols-outlined text-4xl font-bold">check</span>
            </div>

            <h1 className="font-sans font-extrabold text-3xl text-white tracking-widest mb-2 uppercase">
              MISSION ACCOMPLISHED
            </h1>

            <p className="font-sans text-xs text-zinc-400 tracking-wider mb-8">
              All objectives neutralized. Session data logged.
            </p>

            <button
              onClick={handleProceedToDebrief}
              className="px-6 py-3 bg-emerald-500 text-zinc-950 font-sans text-xs font-bold hover:bg-emerald-400 rounded-xl tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer"
            >
              PROCEED TO DEBRIEF
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
