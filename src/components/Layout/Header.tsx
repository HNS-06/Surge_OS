import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { toggleMute, isMuted } from '../../utils/soundEngine';

export default function Header() {
  const {
    currentTab,
    activeSession,
    liveClockString,
    systemNotificationCount,
    setSystemNotificationCount,
    toggleSidebar,
    formatTimer,
    tasks,
  } = useApp();

  const [, setTick] = useState(0);

  const clampedScore = useMemo(() => {
    const now = new Date();
    let tasksDue24h = 0;
    let tasksDue48h = 0;
    let totalEstHoursIncomplete = 0;

    tasks.forEach(t => {
      if (t.completed) return;

      totalEstHoursIncomplete += t.estimatedHours || 0;

      const deadlineDateStr = t.deadlineDate || "2026-06-25";
      const deadlineTimeStr = t.deadlineTime ? (t.deadlineTime.includes(':') ? t.deadlineTime : `${t.deadlineTime}:00`) : '00:00';
      const deadline = new Date(`${deadlineDateStr}T${deadlineTimeStr}`);
      const diffMs = deadline.getTime() - now.getTime();

      if (!isNaN(diffMs)) {
        if (diffMs <= 24 * 60 * 60 * 1000) {
          tasksDue24h++;
        } else if (diffMs <= 48 * 60 * 60 * 1000) {
          tasksDue48h++;
        }
      }
    });

    const cappedHours = Math.min(totalEstHoursIncomplete, 40);
    const hoursScore = (cappedHours / 40) * 30;
    const score = Math.round(20 + (tasksDue24h * 15) + (tasksDue48h * 8) + hoursScore);
    return Math.max(0, Math.min(100, score));
  }, [tasks]);

  const { colorClass, bgBarColorClass } = useMemo(() => {
    if (clampedScore <= 39) {
      return { colorClass: 'text-emerald-400', bgBarColorClass: 'bg-emerald-400' };
    } else if (clampedScore <= 69) {
      return { colorClass: 'text-amber-500', bgBarColorClass: 'bg-amber-500' };
    } else {
      return { colorClass: 'text-red-400 animate-pulse', bgBarColorClass: 'bg-red-400 animate-pulse' };
    }
  }, [clampedScore]);

  const isSurgeModeActive = currentTab === 'surge';

  const dynamicDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <header
      className={`fixed top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-8 border-b z-50 ${
        isSurgeModeActive
          ? 'bg-zinc-950/90 border-red-500/20 backdrop-blur-md'
          : 'bg-zinc-950/80 border-zinc-800/80 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer"
          title="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            S
          </div>
          <span className="font-sans text-lg md:text-xl font-bold tracking-tight text-white uppercase">
            {isSurgeModeActive ? 'SURGE ACTIVE' : 'SURGE OS'}
          </span>
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>

        {isSurgeModeActive ? (
          <div className="flex items-center gap-1.5 ml-2 md:ml-4">
            <span className="font-mono text-xs text-zinc-400 hidden sm:inline">THREAT LEVEL</span>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5 bg-red-500 border border-red-500"></div>
              <div className="w-3.5 h-3.5 bg-red-500 border border-red-500"></div>
              <div className="w-3.5 h-3.5 bg-red-500 border border-red-500"></div>
              <div className="w-3.5 h-3.5 bg-red-500 border border-red-500"></div>
              <div className="w-3.5 h-3.5 bg-zinc-900 border border-zinc-800"></div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-zinc-800 rounded-full bg-zinc-900/50">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-sans text-[11px] font-medium text-zinc-400">SYSTEM STATUS: STANDBY</span>
          </div>
        )}
      </div>

      {isSurgeModeActive && activeSession && (
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-mono text-2xl md:text-4xl font-bold text-red-400 tracking-widest animate-pulse">
            {formatTimer(activeSession.timeRemaining)}
          </span>
          <span className="font-mono text-[9px] tracking-widest text-zinc-400 -mt-1 uppercase hidden sm:block">
            REMAINING UNTIL DROP
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-6 font-sans text-sm text-zinc-400">
        <div className="hidden md:flex flex-col items-start gap-1 select-none">
          <span className="font-sans text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
            COG LOAD:{' '}
            <span className={`${colorClass} ml-1`}>{clampedScore}%</span>
          </span>
          <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${bgBarColorClass}`} style={{ width: `${clampedScore}%` }}></div>
          </div>
        </div>

        {!isSurgeModeActive && (
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-zinc-500 font-medium text-xs">{dynamicDate}</span>
            <span className="text-indigo-400 font-mono text-sm" id="digital-clock">
              {liveClockString}
            </span>
          </div>
        )}

        {isSurgeModeActive ? (
          <button className="hidden sm:flex items-center gap-2 px-4 py-1.5 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-500/10 transition-all rounded-full cursor-pointer" title="System sync">
            <span className="material-symbols-outlined text-sm">sensors</span>
            SYSTEM SYNC
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-2 font-sans text-xs text-zinc-400 font-medium">
            <span className="material-symbols-outlined text-lg text-indigo-500">schedule</span>
            <span className="uppercase">System Clock: {liveClockString}</span>
          </div>
        )}

        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => { toggleMute(); setTick(t => t + 1); }}
            className="hover:bg-zinc-900 transition-colors p-2 rounded-lg cursor-pointer text-indigo-400"
            title={isMuted() ? "Unmute sounds" : "Mute sounds"}
          >
            <span className="material-symbols-outlined text-lg">
              {isMuted() ? "volume_off" : "volume_up"}
            </span>
          </button>
          <button
            className={`hover:bg-zinc-900 transition-colors p-2 rounded-lg relative cursor-pointer ${
              isSurgeModeActive ? 'text-red-400' : 'text-indigo-400'
            }`}
            title="System sensors"
          >
            <span className="material-symbols-outlined text-lg">sensors</span>
          </button>
          <button
            onClick={() => setSystemNotificationCount(0)}
            className={`hover:bg-zinc-900 transition-colors p-2 rounded-lg relative cursor-pointer ${
              isSurgeModeActive ? 'text-red-400' : 'text-indigo-400'
            }`}
            title="Notifications"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            {systemNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-zinc-950 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
