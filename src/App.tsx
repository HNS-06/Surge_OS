import { useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import OnboardingView from './components/Views/OnboardingView';
import OverviewView from './components/Views/OverviewView';
import ScheduleView from './components/Views/ScheduleView';
import SurgeView from './components/Views/SurgeView';
import DebriefView from './components/Views/DebriefView';
import TaskModal from './components/Modals/TaskModal';
import DiagnosisModal from './components/Modals/DiagnosisModal';

export default function App() {
  const { currentTab, isSidebarOpen } = useApp();
  const isSurgeModeActive = currentTab === "surge";

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white relative bg-[#050505] ${isSurgeModeActive ? 'border-4 surge-pulse-border scanline-surge' : 'scanline'}`}>
      <Header />
      <Sidebar />

      <main className={`flex-1 flex flex-col ${isSurgeModeActive ? 'pt-16 h-[calc(100vh-8px)]' : 'md:pl-60 pt-16 min-h-screen'}`}>
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
    </div>
  );
}
