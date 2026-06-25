import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const {
    currentTab,
    setCurrentTab,
    isSidebarOpen,
    toggleSidebar,
    subjects,
    debriefData,
  } = useApp();

  const isSurgeModeActive = currentTab === 'surge';

  if (isSurgeModeActive) return null;

  const navItems: { tab: string; icon: string; label: string }[] = [
    { tab: 'overview', icon: 'dashboard', label: 'OVERVIEW' },
    { tab: 'schedule', icon: 'calendar_today', label: 'SCHEDULE' },
    { tab: 'onboarding', icon: 'school', label: 'SUBJECTS' },
  ];

  if (debriefData) {
    navItems.push({ tab: 'debrief', icon: 'analytics', label: 'DEBRIEF' });
  }

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-60 flex flex-col bg-zinc-950/80 border-r border-zinc-800/80 z-40 pt-16 backdrop-blur-md transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static`}
      >
        <div className="p-6 mb-4 border-b border-zinc-800/40">
          <h2 className="font-sans text-xs font-bold text-zinc-400 tracking-widest uppercase">
            MISSION CONTROL
          </h2>
          <p className="font-sans text-[10px] text-zinc-500 mt-1 uppercase">
            SYSTEM STATUS: NOMINAL
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 px-3">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => {
                if (item.tab === 'onboarding' && subjects.length === 0) {
                  setCurrentTab('onboarding');
                } else {
                  setCurrentTab(item.tab);
                }
                if (isSidebarOpen) toggleSidebar();
              }}
              className={`flex items-center px-4 py-3.5 transition-all text-left font-sans text-xs font-semibold tracking-wide rounded-xl ${
                currentTab === item.tab
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-lg text-indigo-500">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800/40">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              JD
            </div>
            <div className="overflow-hidden">
              <p className="font-sans text-[11px] font-bold tracking-wide truncate text-zinc-300">
                J. DOE
              </p>
              <p className="font-sans text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">
                OPERATOR
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
