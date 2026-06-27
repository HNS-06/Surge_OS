import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, TaskType, AISuggestion, ActiveSurgeSession, SessionDebrief, TabKey, User } from '../types';
import { sfxConfirm, sfxError, sfxAlert, sfxSurgeBoot, sfxTick, sfxMissionComplete, sfxLogout } from '../utils/soundEngine';

const DEFAULT_SUBJECTS = [
  "DATA STRUCTURES",
  "ALGORITHMS_V2",
  "ADVANCED QUANTUM MECHANICS",
  "SYSTEMS_ARCHITECTURE",
  "COGNITIVE NEUROSCIENCE"
];

const DEFAULT_TASKS: Task[] = [
  { id: "algo_assn", name: "Algo Assignment", subject: "ALGORITHMS_V2", type: "ASSIGNMENT", deadlineDate: "2026-06-25", deadlineTime: "22:30", estimatedHours: 4, blockPrediction: "FEAR", completed: false, day: 0, startHour: 19, durationHours: 2.5 },
  { id: "hist_exam", name: "History Exam", subject: "COGNITIVE NEUROSCIENCE", type: "EXAM", deadlineDate: "2026-06-27", deadlineTime: "09:00", estimatedHours: 3, blockPrediction: "FOG", completed: false, day: 4, startHour: 9, durationHours: 2 },
  { id: "lab_sub", name: "Lab Submission", subject: "SYSTEMS_ARCHITECTURE", type: "SUBMISSION", deadlineDate: "2026-06-30", deadlineTime: "17:00", estimatedHours: 2, blockPrediction: null, completed: false, day: 5, startHour: 11, durationHours: 1.5 },
  { id: "study_graph", name: "Study Graph Theory", subject: "ALGORITHMS_V2", type: "ASSIGNMENT", deadlineDate: "2026-06-25", deadlineTime: "14:00", estimatedHours: 2, blockPrediction: "FOG", completed: false, day: 0, startHour: 8, durationHours: 1.5 },
  { id: "write_intro", name: "Write Introduction", subject: "COGNITIVE NEUROSCIENCE", type: "ASSIGNMENT", deadlineDate: "2026-06-25", deadlineTime: "18:00", estimatedHours: 1, blockPrediction: "FOG", completed: false, day: 1, startHour: 15, durationHours: 1 },
  { id: "critical_exam", name: "Quantum Mech Midterm", subject: "ADVANCED QUANTUM MECHANICS", type: "EXAM", deadlineDate: "2026-06-26", deadlineTime: "11:00", estimatedHours: 3, blockPrediction: null, completed: false, day: 2, startHour: 11, durationHours: 2 },
  { id: "infra_audit", name: "Core Infrastructure Audit", subject: "SYSTEMS_ARCHITECTURE", type: "PROJECT", deadlineDate: "2026-06-24", deadlineTime: "10:00", estimatedHours: 1, blockPrediction: null, completed: true, timeSpentMinutes: 45, day: 1, startHour: 9, durationHours: 1 },
  { id: "doc_refresh", name: "API Documentation Refresh", subject: "SYSTEMS_ARCHITECTURE", type: "PROJECT", deadlineDate: "2026-06-24", deadlineTime: "12:30", estimatedHours: 1, blockPrediction: "FRICTION", completed: true, timeSpentMinutes: 72, day: 2, startHour: 10, durationHours: 1.5 },
  { id: "sec_brief", name: "Security Protocol Briefing", subject: "SYSTEMS_ARCHITECTURE", type: "SUBMISSION", deadlineDate: "2026-06-24", deadlineTime: "15:00", estimatedHours: 1, blockPrediction: "FAKE", completed: false, reason: "INFORMATION_OVERLOAD" },
  { id: "budget_sync", name: "Budget Alignment Sync", subject: "SYSTEMS_ARCHITECTURE", type: "SUBMISSION", deadlineDate: "2026-06-24", deadlineTime: "16:30", estimatedHours: 1.5, blockPrediction: "FEAR", completed: false, reason: "DECISION_PARALYSIS" }
];

const DEFAULT_SUGGESTIONS: AISuggestion[] = [
  { id: "sug_1", title: "DEEP WORK: CALCULUS", type: "HIGH_EFFICIENCY", confidence: 92, day: 0, startHour: 19, durationHours: 2.5, timeString: "MON 19:00 - 21:30" },
  { id: "sug_2", title: "BUFFER_GAP_INIT", type: "RECOVERY", confidence: 78, day: 2, startHour: 13, durationHours: 2.0, timeString: "WED 13:30 - 15:30" }
];

export type ToastType = 'success' | 'error' | 'info';

interface AppContextType {
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  suggestions: AISuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<AISuggestion[]>>;
  currentTab: TabKey;
  setCurrentTab: React.Dispatch<React.SetStateAction<TabKey>>;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDiagnosisModalOpen: boolean;
  setIsDiagnosisModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  diagnosingTask: Task | null;
  setDiagnosingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  newSubjectInline: string;
  setNewSubjectInline: React.Dispatch<React.SetStateAction<string>>;
  showAddSubjectInline: boolean;
  setShowAddSubjectInline: React.Dispatch<React.SetStateAction<boolean>>;
  diagnosisStep: number;
  setDiagnosisStep: React.Dispatch<React.SetStateAction<number>>;
  selectedTriggerCode: string;
  setSelectedTriggerCode: React.Dispatch<React.SetStateAction<string>>;
  diagnosisResult: any;
  setDiagnosisResult: React.Dispatch<React.SetStateAction<any>>;
  newTaskName: string;
  setNewTaskName: React.Dispatch<React.SetStateAction<string>>;
  newTaskSubject: string;
  setNewTaskSubject: React.Dispatch<React.SetStateAction<string>>;
  newTaskType: TaskType;
  setNewTaskType: React.Dispatch<React.SetStateAction<TaskType>>;
  newTaskDate: string;
  setNewTaskDate: React.Dispatch<React.SetStateAction<string>>;
  newTaskTime: string;
  setNewTaskTime: React.Dispatch<React.SetStateAction<string>>;
  newTaskEstHours: number;
  setNewTaskEstHours: React.Dispatch<React.SetStateAction<number>>;
  newTaskBlock: 'FOG' | 'FEAR' | 'FRICTION' | 'FAKE' | null;
  setNewTaskBlock: React.Dispatch<React.SetStateAction<'FOG' | 'FEAR' | 'FRICTION' | 'FAKE' | null>>;
  onboardingSubject: string;
  setOnboardingSubject: React.Dispatch<React.SetStateAction<string>>;
  onboardingSemester: string;
  setOnboardingSemester: React.Dispatch<React.SetStateAction<string>>;
  activeSession: ActiveSurgeSession | null;
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSurgeSession | null>>;
  activeBreakoutStepIndex: number;
  setActiveBreakoutStepIndex: React.Dispatch<React.SetStateAction<number>>;
  debriefData: SessionDebrief | null;
  setDebriefData: React.Dispatch<React.SetStateAction<SessionDebrief | null>>;
  isCopied: boolean;
  setIsCopied: React.Dispatch<React.SetStateAction<boolean>>;
  liveClockString: string;
  setLiveClockString: React.Dispatch<React.SetStateAction<string>>;
  systemNotificationCount: number;
  setSystemNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  hrValue: number;
  setHrValue: React.Dispatch<React.SetStateAction<number>>;
  effValue: number;
  setEffValue: React.Dispatch<React.SetStateAction<number>>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  token: string | null;
  saveState: (updatedSubjects: string[], updatedTasks: Task[], updatedSuggestions?: AISuggestion[]) => void;
  formatTimer: (totalSeconds: number) => string;
  handleAddOnboardingSubject: () => void;
  handleRemoveSubject: (name: string) => void;
  handleFinishOnboarding: () => void;
  handleOpenDiagnosis: (task: Task) => void;
  handleSelectTriggerOption: (code: string, label: string, desc: string) => void;
  handleGenerateSurvivalPlan: () => void;
  handleQuickSurgeInitialize: () => void;
  handleToggleSubtask: (id: string) => void;
  triggerSessionCompletion: (session: ActiveSurgeSession) => void;
  handleExportSessionData: () => void;
  handleCopySessionData: () => void;
  handleAddNewTask: (e: React.FormEvent) => void;
  handleAcceptSuggestion: (sug: AISuggestion) => void;
  handleRejectSuggestion: (id: string) => void;
  handleOptimizeFullWeek: () => Promise<void>;
  handleFetchAISuggestions: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  showToast: (message: string, type?: ToastType) => void;
  toastMessage: string | null;
  toastType: ToastType;
  clearToast: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  streakDays: number;
  surgeRank: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [currentTab, setCurrentTab] = useState<TabKey>("overview");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [diagnosingTask, setDiagnosingTask] = useState<Task | null>(null);

  const [newSubjectInline, setNewSubjectInline] = useState("");
  const [showAddSubjectInline, setShowAddSubjectInline] = useState(false);

  const [diagnosisStep, setDiagnosisStep] = useState<number>(1);
  const [selectedTriggerCode, setSelectedTriggerCode] = useState<string>("");
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("ASSIGNMENT");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskEstHours, setNewTaskEstHours] = useState(4);
  const [newTaskBlock, setNewTaskBlock] = useState<'FOG' | 'FEAR' | 'FRICTION' | 'FAKE' | null>(null);

  const [onboardingSubject, setOnboardingSubject] = useState("");
  const [onboardingSemester, setOnboardingSemester] = useState("5");

  const [activeSession, setActiveSession] = useState<ActiveSurgeSession | null>(null);
  const [activeBreakoutStepIndex, setActiveBreakoutStepIndex] = useState<number>(-1);

  const [debriefData, setDebriefData] = useState<SessionDebrief | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [liveClockString, setLiveClockString] = useState("18:31:30");
  const [systemNotificationCount, setSystemNotificationCount] = useState(1);
  const [hrValue, setHrValue] = useState(82);
  const [effValue, setEffValue] = useState(88);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [streakDays, setStreakDays] = useState<number>(0);

  // Track the auto-dismiss timer so rapid successive toasts cancel the previous one
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const surgeRank = React.useMemo(() => {
    if (streakDays <= 2) return "CADET";
    if (streakDays <= 6) return "OPERATIVE";
    if (streakDays <= 13) return "SPECIALIST";
    return "COMMANDER";
  }, [streakDays]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Cancel any in-flight dismiss timer before setting a new one
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastType(type);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
    if (type === 'success') sfxConfirm();
    else if (type === 'error') sfxError();
    else sfxAlert();
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(null);
  }, []);

  const formatTimer = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('surge_subjects');
    const savedTasks = localStorage.getItem('surge_tasks');
    const savedSuggestions = localStorage.getItem('surge_suggestions');
    const savedToken = localStorage.getItem('surge_token');
    const savedUser = localStorage.getItem('surge_user');

    if (savedSubjects && savedTasks) {
      setSubjects(JSON.parse(savedSubjects));
      setTasks(JSON.parse(savedTasks));
    } else {
      setSubjects(DEFAULT_SUBJECTS);
      setTasks(DEFAULT_TASKS);
      localStorage.setItem('surge_subjects', JSON.stringify(DEFAULT_SUBJECTS));
      localStorage.setItem('surge_tasks', JSON.stringify(DEFAULT_TASKS));
    }

    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions));
    } else {
      setSuggestions(DEFAULT_SUGGESTIONS);
      localStorage.setItem('surge_suggestions', JSON.stringify(DEFAULT_SUGGESTIONS));
    }

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else if (!savedSubjects) {
      setCurrentTab("auth");
    }

    if (!savedSubjects && !savedToken) {
      setCurrentTab("auth");
    } else if (!savedSubjects) {
      setCurrentTab("onboarding");
    }

    // Load and check streak
    const savedStreak = localStorage.getItem('surge_streak');
    const savedLastSession = localStorage.getItem('surge_last_session');
    let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;
    if (savedLastSession) {
      const lastSessionTime = parseInt(savedLastSession, 10);
      const nowTime = Date.now();
      if (nowTime - lastSessionTime > 48 * 60 * 60 * 1000) {
        currentStreak = 0;
        localStorage.setItem('surge_streak', '0');
      }
    }
    setStreakDays(currentStreak);
  }, []);

  // Use a ref for activeSession inside the clock interval to avoid tearing down
  // the interval every second when the countdown timer updates activeSession.
  const activeSessionRef = React.useRef(activeSession);
  activeSessionRef.current = activeSession;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveClockString(`${h}:${m}:${s}`);

      if (activeSessionRef.current) {
        setHrValue(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.max(70, Math.min(115, prev + delta));
        });
        setEffValue(prev => {
          const delta = Math.floor(Math.random() * 3) - 1;
          return Math.max(80, Math.min(100, prev + delta));
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Stable: uses activeSessionRef instead of activeSession to avoid recreation

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | null = null;
    if (activeSession && activeSession.timeRemaining > 0 && currentTab === "surge") {
      timerId = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.timeRemaining <= 1) {
            triggerSessionCompletionRef.current(prev);
            return null;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => { if (timerId) clearInterval(timerId); };
  }, [activeSession?.taskId, currentTab]);

  const saveState = useCallback((updatedSubjects: string[], updatedTasks: Task[], updatedSuggestions?: AISuggestion[]) => {
    setSubjects(updatedSubjects);
    setTasks(updatedTasks);
    localStorage.setItem('surge_subjects', JSON.stringify(updatedSubjects));
    localStorage.setItem('surge_tasks', JSON.stringify(updatedTasks));
    if (updatedSuggestions) {
      setSuggestions(updatedSuggestions);
      localStorage.setItem('surge_suggestions', JSON.stringify(updatedSuggestions));
    }
  }, []);

  const handleAddOnboardingSubject = () => {
    if (!onboardingSubject.trim()) return;
    const nameUpper = onboardingSubject.toUpperCase();
    if (!subjects.includes(nameUpper)) {
      saveState([...subjects, nameUpper], tasks);
    }
    setOnboardingSubject("");
  };

  const handleRemoveSubject = (name: string) => {
    saveState(subjects.filter(s => s !== name), tasks);
  };

  const handleFinishOnboarding = () => {
    setCurrentTab("overview");
  };

  const handleOpenDiagnosis = (task: Task) => {
    setDiagnosingTask(task);
    setSelectedTriggerCode("");
    setDiagnosisStep(1);
    setDiagnosisResult(null);
    setIsDiagnosisModalOpen(true);
  };

  const handleSelectTriggerOption = (code: string, label: string, desc: string) => {
    setSelectedTriggerCode(code);
    setDiagnosisStep(2);
    setIsLoading(true);
    // Delay is intentional UI feedback; use a plain timeout then async fetch
    const timerId = setTimeout(() => {
      fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName: diagnosingTask?.name || "unspecified task", feelingId: code, feelingLabel: label, feelingDesc: desc })
      })
        .then(res => res.json())
        .then(result => {
          setDiagnosisResult(result);
          setDiagnosisStep(3);
        })
        .catch(e => console.error("Failed to query diagnosis backend", e))
        .finally(() => setIsLoading(false));
    }, 1200);
    // Store timerId on the window for potential cleanup (diagnosis modal close)
    (window as any).__diagnosisTimer = timerId;
  };

  const handleGenerateSurvivalPlan = () => {
    if (!diagnosingTask || !diagnosisResult) return;
    const microTasks = diagnosisResult.interventionSteps.map((stepText: string, i: number) => ({
      id: `step_${i}`, name: stepText, minutes: 10 + i * 5, completed: false
    }));
    const session: ActiveSurgeSession = {
      taskId: diagnosingTask.id, taskName: diagnosingTask.name,
      totalTime: 45 * 60, timeRemaining: 45 * 60, heartRate: 82, efficiency: 88,
      blockType: diagnosisResult.blockType, systemDiagnosis: diagnosisResult.diagnosisTitle,
      intervention: diagnosisResult.interventionLabel, interventionSteps: diagnosisResult.interventionSteps,
      subtasks: microTasks
    };
    setActiveSession(session);
    setActiveBreakoutStepIndex(-1);
    setIsDiagnosisModalOpen(false);
    setCurrentTab("surge");
    sfxSurgeBoot();
  };

  const handleQuickSurgeInitialize = () => {
    const uncompleted = tasks.find(t => !t.completed) || tasks[0];
    const session: ActiveSurgeSession = {
      taskId: uncompleted?.id || "unspecified", taskName: uncompleted?.name || "General Focus Sprint",
      totalTime: 45 * 60, timeRemaining: 45 * 60, heartRate: 85, efficiency: 90,
      blockType: "FEAR", systemDiagnosis: "SYSTEM DIAGNOSIS: HIGH BURNOUT PROBABILITY ALERT",
      intervention: "INTERVENTION_01: PROACTIVE SPRINT SEGMENTATION",
      interventionSteps: [
        "Eliminate peripheral browser tabs & communication routes.",
        "Synthesize key outline in first 5 minutes.",
        "Sprint for 30 minutes with continuous, unedited drafting.",
        "Allow 10 minutes for structural evaluation and correction."
      ],
      subtasks: [
        { id: "sub_1", name: "Outline key objectives & requirements", minutes: 5, completed: false },
        { id: "sub_2", name: "High-density raw drafting (Zero editing)", minutes: 30, completed: false },
        { id: "sub_3", name: "Polish structural coherence", minutes: 10, completed: false }
      ]
    };
    setActiveSession(session);
    setActiveBreakoutStepIndex(-1);
    setCurrentTab("surge");
    sfxSurgeBoot();
  };

  const handleToggleSubtask = (id: string) => {
    if (!activeSession) return;
    const prevSubtask = activeSession.subtasks.find(s => s.id === id);
    const updatedSubtasks = activeSession.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const calculatedEff = 80 + Math.floor((completedCount / updatedSubtasks.length) * 20);
    setActiveSession({ ...activeSession, subtasks: updatedSubtasks, efficiency: Math.min(100, calculatedEff) });
    // Play tick only when marking complete (not when unchecking)
    if (prevSubtask && !prevSubtask.completed) sfxTick();
  };

  const triggerSessionCompletion = useCallback((session: ActiveSurgeSession) => {
    const completedSub = session.subtasks.filter(s => s.completed).length;
    const totalSub = session.subtasks.length;
    const rate = Math.round((completedSub / totalSub) * 100);
    const nextTasks = tasks.map(t => t.id === session.taskId ? { ...t, completed: true, timeSpentMinutes: Math.round((session.totalTime - session.timeRemaining) / 60) } : t);
    saveState(subjects, nextTasks, suggestions);
    sfxMissionComplete();
    const debrief: SessionDebrief = {
      missionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      durationString: formatTimer(session.totalTime - session.timeRemaining),
      tasksCompleted: `${completedSub}/${totalSub}`, completionRate: rate,
      timeAccuracy: Math.round(75 + Math.random() * 15), timeAccuracyLabel: "LATE_BIAS",
      blockType: session.blockType || "FEAR",
      systemLog: `You tend to abandon high-complexity tasks when the session exceeds 2 hours. Your "${session.blockType || 'FEAR'}" spikes during cognitive and structural drafting transitions.`,
      fogPct: session.blockType === "FOG" ? 48 : 22, fearPct: session.blockType === "FEAR" ? 48 : 22,
      frictionPct: session.blockType === "FRICTION" ? 48 : 15, fakePct: session.blockType === "FAKE" ? 48 : 15,
      timeline: [
        { id: "item_1", title: "Core Objectives Outline", status: 'completed', durationString: "00:08:12", description: "Structured raw drafting criteria successfully locked in." },
        { id: "item_2", title: "Intense Sprint Execution", status: completedSub >= 2 ? 'completed' : 'skipped', durationString: completedSub >= 2 ? "00:30:00" : undefined, description: completedSub >= 2 ? "High immersion achieved. Flow state output maintained." : "Session halted due to sudden friction.", reason: completedSub >= 2 ? undefined : "DECISION_PARALYSIS" },
        { id: "item_3", title: "Structural Evaluation Sync", status: completedSub === totalSub ? 'completed' : 'skipped', durationString: completedSub === totalSub ? "00:07:00" : undefined, description: completedSub === totalSub ? "Calibrated draft coordinates aligned perfectly." : "Postponed for next session.", reason: completedSub === totalSub ? undefined : "INFORMATION_OVERLOAD" }
      ]
    };
    // Update streak and rank
    const nowTime = Date.now();
    const savedLastSession = localStorage.getItem('surge_last_session');
    let nextStreak = streakDays;
    if (savedLastSession) {
      const lastSessionTime = parseInt(savedLastSession, 10);
      if (nowTime - lastSessionTime > 48 * 60 * 60 * 1000) {
        nextStreak = 0;
      }
    }
    nextStreak += 1;
    setStreakDays(nextStreak);
    localStorage.setItem('surge_streak', String(nextStreak));
    localStorage.setItem('surge_last_session', String(nowTime));

    setDebriefData(debrief);
    setActiveSession(null);
    setCurrentTab("debrief");
  }, [tasks, subjects, suggestions, saveState, formatTimer, setDebriefData, setActiveSession, setCurrentTab, streakDays]);

  const triggerSessionCompletionRef = React.useRef(triggerSessionCompletion);
  triggerSessionCompletionRef.current = triggerSessionCompletion;

  const handleExportSessionData = () => {
    if (!debriefData) return;
    const d = debriefData;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SURGE OS — Session Debrief ${d.missionDate}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #050505; color: #e4e4e7; padding: 40px; }
  .container { max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 2px solid #27272a; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fff; }
  .header p { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
  .stat { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; }
  .stat-label { font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 6px; }
  .stat-value { font-size: 24px; font-weight: 800; }
  .stat-value.white { color: #fff; }
  .stat-value.amber { color: #f59e0b; }
  .stat-value.red { color: #f87171; }
  .stat-sub { font-size: 10px; color: #a1a1aa; font-weight: 600; margin-top: 2px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #27272a; }
  .timeline-item { position: relative; padding-left: 28px; margin-bottom: 16px; }
  .timeline-dot { position: absolute; left: 0; top: 4px; width: 18px; height: 18px; border-radius: 50%; border: 1px solid #3f3f46; background: #09090b; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .timeline-dot.done { color: #34d399; border-color: #34d399; }
  .timeline-dot.skip { color: #52525b; }
  .timeline-title { font-size: 13px; font-weight: 700; color: #fff; }
  .timeline-duration { font-size: 11px; color: #34d399; font-weight: 700; margin-left: 8px; }
  .timeline-desc { font-size: 11px; color: #a1a1aa; margin-top: 4px; line-height: 1.5; }
  .timeline-reason { display: inline-block; margin-top: 6px; padding: 2px 8px; background: #18181b; border: 1px solid #27272a; border-radius: 6px; font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }
  .bar-row { margin-bottom: 10px; }
  .bar-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
  .bar-track { height: 6px; background: #09090b; border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; }
  .bar-fill.fog { background: #71717a; }
  .bar-fill.fear { background: #f87171; }
  .bar-fill.friction { background: #f59e0b; }
  .bar-fill.fake { background: #6366f1; }
  .system-log { background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.15); border-radius: 10px; padding: 14px; font-size: 11px; color: #818cf8; line-height: 1.6; }
  .system-log strong { font-weight: 700; }
  .footer { border-top: 1px solid #27272a; padding-top: 16px; margin-top: 30px; text-align: center; font-size: 9px; color: #52525b; text-transform: uppercase; letter-spacing: 3px; }
  @media print {
    body { background: #fff; color: #1a1a1a; padding: 20px; }
    .stat { background: #f4f4f5; border-color: #e4e4e7; }
    .stat-label { color: #71717a; }
    .stat-value.white, .header h1, .timeline-title { color: #000; }
    .timeline-desc, .bar-label, .stat-sub { color: #52525b; }
    .bar-track { background: #e4e4e7; }
    .system-log { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }
    .section-title { color: #4f46e5; }
    .section-title::after { background: #e4e4e7; }
    .header { border-color: #e4e4e7; }
    .footer { border-color: #e4e4e7; color: #a1a1aa; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Session Debrief — SURGE OS</h1>
    <p>Mission Date: ${d.missionDate} &nbsp;|&nbsp; Duration: ${d.durationString}</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">Tasks Completed</div>
      <div class="stat-value white">${d.tasksCompleted}</div>
      <div class="stat-sub">${d.completionRate}% completion rate</div>
    </div>
    <div class="stat">
      <div class="stat-label">Time Accuracy</div>
      <div class="stat-value amber">${d.timeAccuracy}%</div>
      <div class="stat-sub">${d.timeAccuracyLabel}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Block Type</div>
      <div class="stat-value red">${d.blockType}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">System Report</div>
    <div class="system-log"><strong>SYSTEM REPORT:</strong> ${d.systemLog}</div>
  </div>

  <div class="section">
    <div class="section-title">Block Distribution</div>
    <div class="bar-row">
      <div class="bar-label"><span style="color:#a1a1aa">FOG</span><span style="color:#a1a1aa">${d.fogPct}%</span></div>
      <div class="bar-track"><div class="bar-fill fog" style="width:${d.fogPct}%"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span style="color:#f87171">FEAR</span><span style="color:#f87171">${d.fearPct}%</span></div>
      <div class="bar-track"><div class="bar-fill fear" style="width:${d.fearPct}%"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span style="color:#f59e0b">FRICTION</span><span style="color:#f59e0b">${d.frictionPct}%</span></div>
      <div class="bar-track"><div class="bar-fill friction" style="width:${d.frictionPct}%"></div></div>
    </div>
    <div class="bar-row">
      <div class="bar-label"><span style="color:#6366f1">FAKE</span><span style="color:#6366f1">${d.fakePct}%</span></div>
      <div class="bar-track"><div class="bar-fill fake" style="width:${d.fakePct}%"></div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Timeline</div>
    ${d.timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.status === 'completed' ? 'done' : 'skip'}">${item.status === 'completed' ? '&#10003;' : '&#10007;'}</div>
      <span class="timeline-title">${item.title}</span>
      ${item.durationString ? `<span class="timeline-duration">[${item.durationString}]</span>` : ''}
      ${item.status === 'skipped' ? '<span class="timeline-duration" style="color:#71717a">[SKIPPED]</span>' : ''}
      <div class="timeline-desc">${item.description}</div>
      ${item.reason ? `<div class="timeline-reason">REASON: ${item.reason}</div>` : ''}
    </div>`).join('')}
  </div>

  <div class="footer">Generated by SURGE OS &mdash; Tactical Productivity Command Center</div>
</div>
</body>
</html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
    showToast("PDF export ready — use Save as PDF in the print dialog", "success");
  };

  const handleCopySessionData = () => {
    if (!debriefData) return;
    const jsonStr = JSON.stringify(debriefData, null, 2);
    const triggerSuccess = () => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(triggerSuccess).catch(() => fallbackCopy(jsonStr));
    } else {
      fallbackCopy(jsonStr);
    }
    function fallbackCopy(text: string) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); triggerSuccess(); } catch (err) { console.error('Fallback copy failed', err); }
      document.body.removeChild(textArea);
    }
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const taskSub = newTaskSubject || subjects[0] || "GENERAL";
    const taskId = `task_${Date.now()}`;
    // Bug fix #1: parse date parts manually to avoid UTC midnight timezone shift
    const [year, month, day] = (newTaskDate || "2026-06-25").split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    // Bug fix #2: remap JS .getDay() (0=Sun) to grid index (0=Mon)
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const schedHour = parseInt(newTaskTime.split(":")[0]) || 9;
    const added: Task = {
      id: taskId, name: newTaskName, subject: taskSub, type: newTaskType,
      deadlineDate: newTaskDate || "2026-06-25", deadlineTime: newTaskTime || "09:00",
      estimatedHours: newTaskEstHours, blockPrediction: newTaskBlock, completed: false,
      day: dayIndex, startHour: schedHour, durationHours: newTaskEstHours
    };
    saveState(subjects, [...tasks, added]);
    setNewTaskName(""); setNewTaskSubject(""); setNewTaskDate(""); setNewTaskTime("");
    setNewTaskEstHours(4); setNewTaskBlock(null); setIsTaskModalOpen(false);
    showToast("Task added to radar", "success");
  };

  const handleAcceptSuggestion = (sug: AISuggestion) => {
    const schedTask: Task = {
      id: `task_sug_${Date.now()}`, name: sug.title,
      subject: subjects.find(s => sug.title.includes(s)) || subjects[0] || "GENERAL",
      type: sug.type === "RECOVERY" ? "PROJECT" : "ASSIGNMENT",
      deadlineDate: "2026-06-25", deadlineTime: "19:00",
      estimatedHours: sug.durationHours, blockPrediction: null, completed: false,
      day: sug.day, startHour: sug.startHour, durationHours: sug.durationHours
    };
    saveState(subjects, [...tasks, schedTask], suggestions.filter(s => s.id !== sug.id));
    showToast("Suggestion accepted and scheduled", "success");
  };

  const handleRejectSuggestion = (id: string) => {
    const nextSuggestions = suggestions.filter(s => s.id !== id);
    setSuggestions(nextSuggestions);
    localStorage.setItem('surge_suggestions', JSON.stringify(nextSuggestions));
  };

  const handleFetchAISuggestions = useCallback(async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/suggest-slots', {
        method: 'POST',
        headers,
        body: JSON.stringify({ tasks, subjects })
      });
      if (!response.ok) return;
      const data = await response.json();
      const incoming: AISuggestion[] = data.suggestions || [];
      if (!incoming.length) return;
      setSuggestions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const merged = [...prev, ...incoming.filter(s => !existingIds.has(s.id))];
        localStorage.setItem('surge_suggestions', JSON.stringify(merged));
        return merged;
      });
    } catch (e) {
      console.error("Failed to fetch AI suggestions", e);
    }
  }, [tasks, subjects, token]);

  const handleOptimizeFullWeek = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/optimize-week', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, subjects })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.optimizedTasks)) throw new Error('Invalid response shape');
      const nextTasks = tasks.map(t => {
        const found = data.optimizedTasks.find((ot: any) => ot.id === t.id);
        if (found) return { ...t, day: found.day, startHour: found.startHour, durationHours: found.durationHours, reason: found.reason || t.reason };
        return t;
      });
      saveState(subjects, nextTasks);
      showToast(`Burnout Rebalancing Complete: ${data.strategyText}`, "success");
    } catch (e) {
      console.error("Failed to rebalance week using AI server", e);
      showToast("Failed to optimize schedule", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const syncServerData = async (authToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      const [tRes, sRes, sgRes] = await Promise.all([
        fetch('/api/data/tasks', { headers }),
        fetch('/api/data/subjects', { headers }),
        fetch('/api/data/suggestions', { headers })
      ]);
      // Check each response individually before parsing
      if (!tRes.ok || !sRes.ok || !sgRes.ok) {
        console.error('syncServerData: one or more data endpoints returned an error');
        return;
      }
      const [serverTasks, serverSubjects, serverSuggestions] = await Promise.all([
        tRes.json() as Promise<Task[]>,
        sRes.json() as Promise<string[]>,
        sgRes.json() as Promise<AISuggestion[]>
      ]);
      if ((serverSubjects?.length ?? 0) > 0 || (serverTasks?.length ?? 0) > 0) {
        saveState(
          Array.isArray(serverSubjects) ? serverSubjects : [],
          Array.isArray(serverTasks) ? serverTasks : [],
          Array.isArray(serverSuggestions) ? serverSuggestions : []
        );
      }
    } catch (e) {
      console.error("Failed to sync server data", e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('surge_token', data.token);
        localStorage.setItem('surge_user', JSON.stringify(data.user));
        await syncServerData(data.token);
        handleFetchAISuggestions();
        showToast(`Welcome back, ${data.user.name}`, "success");
        setCurrentTab("overview");
        return true;
      }
      showToast(data.error || "Login failed", "error");
      return false;
    } catch { showToast("Login failed", "error"); return false; } finally { setIsLoading(false); }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await response.json();
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('surge_token', data.token);
        localStorage.setItem('surge_user', JSON.stringify(data.user));
        await syncServerData(data.token);
        handleFetchAISuggestions();
        showToast(`Account created. Welcome, ${data.user.name}`, "success");
        setCurrentTab("overview");
        return true;
      }
      showToast(data.error || "Registration failed", "error");
      return false;
    } catch { showToast("Registration failed", "error"); return false; } finally { setIsLoading(false); }
  };

  const logout = () => {
    sfxLogout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('surge_token');
    localStorage.removeItem('surge_user');
    showToast("Logged out successfully", "info");
    setCurrentTab("auth");
  };

  return (
    <AppContext.Provider value={{
      subjects, setSubjects, tasks, setTasks, suggestions, setSuggestions,
      currentTab, setCurrentTab, isTaskModalOpen, setIsTaskModalOpen,
      isDiagnosisModalOpen, setIsDiagnosisModalOpen, diagnosingTask, setDiagnosingTask,
      newSubjectInline, setNewSubjectInline, showAddSubjectInline, setShowAddSubjectInline,
      diagnosisStep, setDiagnosisStep, selectedTriggerCode, setSelectedTriggerCode,
      diagnosisResult, setDiagnosisResult, newTaskName, setNewTaskName,
      newTaskSubject, setNewTaskSubject, newTaskType, setNewTaskType,
      newTaskDate, setNewTaskDate, newTaskTime, setNewTaskTime,
      newTaskEstHours, setNewTaskEstHours, newTaskBlock, setNewTaskBlock,
      onboardingSubject, setOnboardingSubject, onboardingSemester, setOnboardingSemester,
      activeSession, setActiveSession, activeBreakoutStepIndex, setActiveBreakoutStepIndex,
      debriefData, setDebriefData, isCopied, setIsCopied,
      liveClockString, setLiveClockString, systemNotificationCount, setSystemNotificationCount,
      hrValue, setHrValue, effValue, setEffValue,
      isSidebarOpen, toggleSidebar, user, token,
      saveState, formatTimer,
      handleAddOnboardingSubject, handleRemoveSubject, handleFinishOnboarding,
      handleOpenDiagnosis, handleSelectTriggerOption, handleGenerateSurvivalPlan,
      handleQuickSurgeInitialize, handleToggleSubtask, triggerSessionCompletion,
      handleExportSessionData, handleCopySessionData, handleAddNewTask,
      handleAcceptSuggestion, handleRejectSuggestion, handleOptimizeFullWeek, handleFetchAISuggestions,
      login, register, logout,
      showToast, toastMessage, toastType, clearToast,
      isLoading, setIsLoading,
      streakDays, surgeRank
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
