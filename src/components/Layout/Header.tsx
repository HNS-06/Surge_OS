import { useApp } from '../../context/AppContext';

export default function Header() {
  const {
    currentTab,
    activeSession,
    liveClockString,
    systemNotificationCount,
    setSystemNotificationCount,
    toggleSidebar,
    formatTimer,
  } = useApp();

  const isSurgeModeActive = currentTab === 'surge';

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
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-400"
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
        {!isSurgeModeActive && (
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-zinc-500 font-medium text-xs">24 OCT 2026</span>
            <span className="text-indigo-400 font-mono text-sm" id="digital-clock">
              {liveClockString}
            </span>
          </div>
        )}

        {isSurgeModeActive ? (
          <button className="hidden sm:flex items-center gap-2 px-4 py-1.5 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-500/10 transition-all rounded-full">
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
            className={`hover:bg-zinc-900 transition-colors p-2 rounded-lg relative ${
              isSurgeModeActive ? 'text-red-400' : 'text-indigo-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">sensors</span>
          </button>
          <button
            onClick={() => setSystemNotificationCount(0)}
            className={`hover:bg-zinc-900 transition-colors p-2 rounded-lg relative ${
              isSurgeModeActive ? 'text-red-400' : 'text-indigo-400'
            }`}
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
