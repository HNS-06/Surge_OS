import { useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingView from './components/Views/OnboardingView';
import OverviewView from './components/Views/OverviewView';
import ScheduleView from './components/Views/ScheduleView';
import SurgeView from './components/Views/SurgeView';
import DebriefView from './components/Views/DebriefView';
import AuthView from './components/Views/AuthView';
import TaskModal from './components/Modals/TaskModal';
import DiagnosisModal from './components/Modals/DiagnosisModal';
import CommandPalette from './components/CommandPalette';

export default function App() {
  const { currentTab, isSidebarOpen, toastMessage, toastType, clearToast, isLoading } = useApp();
  const isSurgeModeActive = currentTab === "surge";
  const isAuth = currentTab === "auth";

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white relative bg-[#050505] ${isSurgeModeActive ? 'border-4 surge-pulse-border scanline-surge' : 'scanline'}`}>
      {!isAuth && <Header />}
      {!isAuth && <Sidebar />}

      <main className={`${isSurgeModeActive ? 'fixed inset-0 pt-16' : isAuth ? 'min-h-screen' : 'fixed top-16 left-0 right-0 bottom-0 md:left-60'} flex flex-col`}>
        {currentTab === "auth" && <AuthView />}
        {currentTab === "onboarding" && <OnboardingView />}
        {currentTab === "overview" && <OverviewView />}
        {currentTab === "schedule" && <ScheduleView />}
        {currentTab === "surge" && <SurgeView />}
        {currentTab === "debrief" && <DebriefView />}
      </main>

      {!isSurgeModeActive && (
        <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#adc6ff]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      )}

      <TaskModal />
      <DiagnosisModal />
      <CommandPalette />

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="font-sans text-xs font-bold text-zinc-400 tracking-widest uppercase">PROCESSING...</span>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[150] max-w-md px-5 py-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 cursor-pointer transition-all animate-[slideUp_0.3s_ease-out] ${
            toastType === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' :
            toastType === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-400' :
            'bg-zinc-900/90 border-zinc-700/50 text-zinc-300'
          }`}
          onClick={clearToast}
        >
          <span className="material-symbols-outlined text-lg">
            {toastType === 'success' ? 'check_circle' : toastType === 'error' ? 'error' : 'info'}
          </span>
          <span className="font-sans text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
