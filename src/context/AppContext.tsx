import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, TaskType, AISuggestion, ActiveSurgeSession, SessionDebrief, TabKey, User } from '../types';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
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

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
    }

    if (!savedSubjects) {
      setCurrentTab("onboarding");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveClockString(`${h}:${m}:${s}`);

      if (activeSession) {
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
  }, [activeSession]);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    if (activeSession && activeSession.timeRemaining > 0 && currentTab === "surge") {
      timerId = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.timeRemaining <= 1) {
            clearInterval(timerId);
            triggerSessionCompletion(prev);
            return null;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => { if (timerId) clearInterval(timerId); };
  }, [activeSession, currentTab]);

  const saveState = (updatedSubjects: string[], updatedTasks: Task[], updatedSuggestions?: AISuggestion[]) => {
    setSubjects(updatedSubjects);
    setTasks(updatedTasks);
    localStorage.setItem('surge_subjects', JSON.stringify(updatedSubjects));
    localStorage.setItem('surge_tasks', JSON.stringify(updatedTasks));
    if (updatedSuggestions) {
      setSuggestions(updatedSuggestions);
      localStorage.setItem('surge_suggestions', JSON.stringify(updatedSuggestions));
    }
  };

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

  const handleSelectTriggerOption = async (code: string, label: string, desc: string) => {
    setSelectedTriggerCode(code);
    setDiagnosisStep(2);
    setTimeout(async () => {
      try {
        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskName: diagnosingTask?.name || "unspecified task", feelingId: code, feelingLabel: label, feelingDesc: desc })
        });
        const result = await response.json();
        setDiagnosisResult(result);
        setDiagnosisStep(3);
      } catch (e) {
        console.error("Failed to query diagnosis backend", e);
      }
    }, 1200);
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
  };

  const handleToggleSubtask = (id: string) => {
    if (!activeSession) return;
    const updatedSubtasks = activeSession.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const calculatedEff = 80 + Math.floor((completedCount / updatedSubtasks.length) * 20);
    setActiveSession({ ...activeSession, subtasks: updatedSubtasks, efficiency: Math.min(100, calculatedEff) });
  };

  const triggerSessionCompletion = (session: ActiveSurgeSession) => {
    const completedSub = session.subtasks.filter(s => s.completed).length;
    const totalSub = session.subtasks.length;
    const rate = Math.round((completedSub / totalSub) * 100);
    const nextTasks = tasks.map(t => t.id === session.taskId ? { ...t, completed: true, timeSpentMinutes: Math.round((session.totalTime - session.timeRemaining) / 60) } : t);
    saveState(subjects, nextTasks);
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
    setDebriefData(debrief);
    setCurrentTab("debrief");
  };

  const handleExportSessionData = () => {
    if (!debriefData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(debriefData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `session-debrief-${debriefData.missionDate.replace(/\./g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
    const selectedDateObj = new Date(newTaskDate || "2026-06-25");
    const dayIndex = Math.max(0, Math.min(6, selectedDateObj.getDay()));
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
  };

  const handleRejectSuggestion = (id: string) => {
    const nextSuggestions = suggestions.filter(s => s.id !== id);
    setSuggestions(nextSuggestions);
    localStorage.setItem('surge_suggestions', JSON.stringify(nextSuggestions));
  };

  const handleOptimizeFullWeek = async () => {
    try {
      const response = await fetch('/api/optimize-week', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, subjects })
      });
      const data = await response.json();
      const nextTasks = tasks.map(t => {
        const found = data.optimizedTasks.find((ot: any) => ot.id === t.id);
        if (found) return { ...t, day: found.day, startHour: found.startHour, durationHours: found.durationHours, reason: found.reason || t.reason };
        return t;
      });
      saveState(subjects, nextTasks);
      alert(`Burnout Rebalancing Complete:\n\n${data.strategyText}`);
    } catch (e) {
      console.error("Failed to rebalance week using AI server", e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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
        return true;
      }
      return false;
    } catch { return false; }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
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
        return true;
      }
      return false;
    } catch { return false; }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('surge_token');
    localStorage.removeItem('surge_user');
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
      handleAcceptSuggestion, handleRejectSuggestion, handleOptimizeFullWeek,
      login, register, logout
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
