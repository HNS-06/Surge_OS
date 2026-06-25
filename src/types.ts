export type TaskType = 'EXAM' | 'ASSIGNMENT' | 'SUBMISSION' | 'PROJECT';

export interface Task {
  id: string;
  name: string;
  subject: string;
  type: TaskType;
  deadlineDate: string;
  deadlineTime: string;
  estimatedHours: number;
  blockPrediction: 'FOG' | 'FEAR' | 'FRICTION' | 'FAKE' | null;
  completed: boolean;
  timeSpentMinutes?: number;
  day?: number;
  startHour?: number;
  durationHours?: number;
  reason?: string | null;
}

export interface AISuggestion {
  id: string;
  title: string;
  type: 'HIGH_EFFICIENCY' | 'RECOVERY' | 'FOCUS';
  confidence: number;
  day: number;
  startHour: number;
  durationHours: number;
  timeString: string;
}

export interface ActiveSurgeSession {
  taskId: string;
  taskName: string;
  timeRemaining: number;
  totalTime: number;
  heartRate: number;
  efficiency: number;
  blockType: 'FOG' | 'FEAR' | 'FRICTION' | 'FAKE' | null;
  systemDiagnosis: string;
  intervention: string;
  interventionSteps: string[];
  subtasks: { id: string; name: string; minutes: number; completed: boolean }[];
}

export interface SessionDebrief {
  missionDate: string;
  durationString: string;
  tasksCompleted: string;
  completionRate: number;
  timeAccuracy: number;
  timeAccuracyLabel: string;
  blockType: 'FOG' | 'FEAR' | 'FRICTION' | 'FAKE';
  systemLog: string;
  fogPct: number;
  fearPct: number;
  frictionPct: number;
  fakePct: number;
  timeline: {
    id: string;
    title: string;
    status: 'completed' | 'skipped';
    durationString?: string;
    description: string;
    reason?: string;
  }[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export type TabKey = 'onboarding' | 'overview' | 'schedule' | 'surge' | 'debrief';
