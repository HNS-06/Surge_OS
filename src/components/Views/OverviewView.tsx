import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export default function OverviewView() {
  const { tasks, handleOpenDiagnosis, handleQuickSurgeInitialize, setIsTaskModalOpen } = useApp();

  const incompleteTasks = useMemo(() =>
    tasks.filter(t => !t.completed).sort((a, b) => {
      const da = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`);
      const db = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`);
      return da.getTime() - db.getTime();
    }),
  [tasks]);

  const focusTasks = incompleteTasks.slice(0, 4);

  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const totalTasks = tasks;
  const quotaPct = totalTasks.length > 0 ? Math.round((completedTasks.length / totalTasks.length) * 100) : 0;
  const quotaOffset = 452.38 - (452.38 * quotaPct / 100);

  const deadlineItems = useMemo(() => {
    const now = new Date();
    return incompleteTasks.map(t => {
      const deadline = new Date(`${t.deadlineDate}T${t.deadlineTime || '23:59'}`);
      const diffMs = deadline.getTime() - now.getTime();
      const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const diffDays = Math.floor(diffHours / 24);
      const remHours = diffHours % 24;

      let color: string;
      let label: string;
      if (diffHours < 24) { color = 'red'; label = 'CRITICAL'; }
      else if (diffHours < 72) { color = 'amber'; label = 'INCOMING'; }
      else { color = 'indigo'; label = 'NOMINAL'; }

      const tMinus = diffDays > 0 ? `T-MINUS: ${diffDays}D ${remHours}H` : `T-MINUS: ${diffHours}H ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}M`;

      return { ...t, color, label, tMinus, deadline };
    }).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [incompleteTasks]);

  const hasUrgentDeadlines = useMemo(() => {
    const now = new Date();
    return incompleteTasks.some(t => {
      const deadline = new Date(`${t.deadlineDate}T${t.deadlineTime || '23:59'}`);
      return (deadline.getTime() - now.getTime()) < 48 * 60 * 60 * 1000;
    });
  }, [incompleteTasks]);

  const activityMatrix = useMemo(() => {
    const days = 21;
    const cells: { opacity: number; date: string }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = completedTasks.filter(t => {
        const td = new Date(`${t.deadlineDate}T${t.deadlineTime || '23:59'}`);
        return td.toISOString().split('T')[0] === dateStr;
      }).length;
      cells.push({ opacity: count > 0 ? Math.min(1, count / 3) : 0, date: dateStr });
    }

    const maxCount = Math.max(1, ...cells.map(c => c.opacity));
    return cells.map(c => ({ ...c, opacity: c.opacity / maxCount }));
  }, [completedTasks]);

  const behavioralInsights = useMemo(() => {
    if (completedTasks.length < 3) return null;

    const hourCounts: Record<number, number> = {};
    completedTasks.forEach(t => {
      if (t.startHour !== undefined) {
        hourCounts[t.startHour] = (hourCounts[t.startHour] || 0) + 1;
      }
    });
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    const typeIncomplete: Record<string, { total: number; incomplete: number }> = {};
    tasks.forEach(t => {
      if (!typeIncomplete[t.type]) typeIncomplete[t.type] = { total: 0, incomplete: 0 };
      typeIncomplete[t.type].total++;
      if (!t.completed) typeIncomplete[t.type].incomplete++;
    });
    const worstType = Object.entries(typeIncomplete)
      .map(([type, data]) => ({ type, rate: data.incomplete / data.total }))
      .sort((a, b) => b.rate - a.rate)[0];

    return { bestHour, worstType };
  }, [tasks, completedTasks]);

  const colorMap: Record<string, { dot: string; text: string; shadow: string }> = {
    red: { dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', text: 'text-red-400', shadow: 'text-red-400' },
    amber: { dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', text: 'text-amber-500', shadow: 'text-amber-500' },
    indigo: { dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]', text: 'text-indigo-400', shadow: 'text-indigo-400' },
  };

  return (
    <div className="absolute inset-0 grid grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar bg-[#050505]">

      {/* Column 1: Deadline Radar */}
      <section className="col-span-12 lg:col-span-3 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 shadow-lg flex flex-col relative min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-sans text-xs font-bold text-zinc-400 tracking-widest uppercase">DEADLINE RADAR</h2>
          <span className="material-symbols-outlined text-indigo-400 text-lg">radar</span>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 relative custom-scrollbar">
          {deadlineItems.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50 h-full flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-zinc-600 text-3xl mb-2">check_circle</span>
              <p className="font-sans text-[10px] text-zinc-500 uppercase font-semibold">ALL CLEAR — NO DEADLINES</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-zinc-800/80"></div>

              {deadlineItems.map(item => {
                const colors = colorMap[item.color];
                return (
                  <div key={item.id} className="relative pl-8">
                    <div className={`absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full ${colors.dot}`}></div>
                    <div className="flex flex-col gap-1">
                      <span className={`font-sans text-[10px] font-bold ${colors.text}`}>{item.type} [{item.label}]</span>
                      <h3 className="font-sans font-bold text-sm text-white leading-tight">{item.name}</h3>
                      <div className={`font-sans text-xs ${colors.text} flex items-center gap-1.5 mt-1`}>
                        <span className="material-symbols-outlined text-sm">timer</span>
                        {item.tMinus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Column 2: Today's Focus (Center Actions) */}
      <section className="col-span-12 lg:col-span-5 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 shadow-lg flex flex-col min-h-[400px]">

        {/* Giant focus progress dial */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-zinc-800" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-indigo-500 transition-all duration-1000" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeDasharray="452.38" strokeDashoffset={quotaOffset} strokeWidth="6" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-sans text-3xl font-extrabold text-white">{quotaPct}%</span>
              <span className="font-sans text-[10px] font-semibold tracking-wider text-zinc-500 mt-0.5">DAILY QUOTA</span>
            </div>
          </div>
          <h2 className="font-sans text-xl font-bold text-white tracking-tight uppercase">TODAY'S FOCUS</h2>
        </div>

        {/* Tasks List */}
        <div className="space-y-4 w-full">
          {focusTasks.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
              <span className="material-symbols-outlined text-zinc-600 text-3xl mb-2">task_alt</span>
              <p className="font-sans text-[10px] text-zinc-500 uppercase font-semibold">NO PENDING TASKS</p>
            </div>
          ) : (
            focusTasks.map(task => (
              <div
                key={task.id}
                className="border border-zinc-800 bg-zinc-950 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md font-sans text-[10px] font-semibold uppercase">
                      {task.type}
                    </span>
                    <span className="font-sans text-xs text-zinc-500 font-medium">
                      {task.estimatedHours} HOURS
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-sm text-zinc-100">{task.name}</h3>
                </div>
                <button
                  onClick={() => handleOpenDiagnosis(task)}
                  className="font-sans text-[10px] font-bold border border-zinc-800 bg-zinc-900 hover:border-indigo-500 hover:bg-zinc-800 hover:text-white px-4 py-2 transition-all text-zinc-400 shrink-0 rounded-xl cursor-pointer"
                >
                  WHY AM I STUCK?
                </button>
              </div>
            ))
          )}

          {/* Suggested Ghost card slot for entering new task */}
          <div
            onClick={() => setIsTaskModalOpen(true)}
            className="border border-dashed border-zinc-850 p-5 flex justify-center items-center h-24 opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-zinc-950/20 hover:border-indigo-500/50 rounded-2xl"
          >
            <div className="flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-zinc-500 text-xl">add_circle</span>
              <span className="font-sans text-xs font-bold text-zinc-400 tracking-wider uppercase">INITIALIZE NEW SEQUENCE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Column 3: Pattern Intel */}
      <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">

        {/* Card 3.1: Activity Matrix */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-widest">ACTIVITY MATRIX</span>
            <span className="font-sans text-xs text-indigo-400 font-bold">STABILITY: {completedTasks.length > 0 ? Math.min(99, 80 + completedTasks.length * 2) : 0}%</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {activityMatrix.map((cell, i) => (
              <div
                key={i}
                className="h-4 bg-indigo-500 rounded-md transition-all"
                style={{ opacity: Math.max(0.05, cell.opacity) }}
                title={cell.date}
              ></div>
            ))}
          </div>
        </div>

        {/* Card 3.2: Behavioral Insights */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 shadow-lg space-y-4">
          <h3 className="font-sans text-xs font-bold text-zinc-400 tracking-widest uppercase">BEHAVIORAL DIAGNOSTICS</h3>

          {behavioralInsights ? (
            <>
              <div className="border border-zinc-800/80 p-4 bg-indigo-500/5 border-l-4 border-l-indigo-500 flex gap-3.5 items-start rounded-2xl">
                <span className="material-symbols-outlined text-indigo-400 text-lg font-bold">bolt</span>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  You complete tasks <span className="text-indigo-400 font-bold">faster</span> before {behavioralInsights.bestHour ? `${behavioralInsights.bestHour[0]}hr` : '11am'}. Optimize early focus.
                </p>
              </div>

              <div className="border border-zinc-800/80 p-4 bg-red-500/5 border-l-4 border-l-red-500 flex gap-3.5 items-start rounded-2xl">
                <span className="material-symbols-outlined text-red-400 text-lg font-bold">warning</span>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  {behavioralInsights.worstType ? (
                    <>Tasks tagged <span className="text-red-400 font-bold">"{behavioralInsights.worstType.type}"</span> get skipped {Math.round(behavioralInsights.worstType.rate * 100)}% of the time. Break them down.</>
                  ) : (
                    <>Assignments tagged <span className="text-red-400 font-bold">"long"</span> get skipped 70% of the time. Break them down.</>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="border border-zinc-800/80 p-4 bg-indigo-500/5 border-l-4 border-l-indigo-500 flex gap-3.5 items-start rounded-2xl">
                <span className="material-symbols-outlined text-indigo-400 text-lg font-bold">bolt</span>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  You complete tasks <span className="text-indigo-400 font-bold">faster</span> before 11am. Optimize early focus.
                </p>
              </div>

              <div className="border border-zinc-800/80 p-4 bg-red-500/5 border-l-4 border-l-red-500 flex gap-3.5 items-start rounded-2xl">
                <span className="material-symbols-outlined text-red-400 text-lg font-bold">warning</span>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  Assignments tagged <span className="text-red-400 font-bold">"long"</span> get skipped 70% of the time. Break them down.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Card 3.3: Proactive Surge alert & launcher block */}
        {hasUrgentDeadlines && (
          <div className="border border-red-500/20 p-6 bg-red-950/10 relative overflow-hidden rounded-[2rem] shadow-lg flex-grow flex flex-col justify-center">
            <div className="relative z-10">
              <div className="font-sans font-bold text-sm text-red-400 mb-1.5 tracking-wide uppercase">SURGE PROTOCOL REQUIRED</div>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed mb-4">
                Deadlines are converging. Activate SURGE to override normal constraints and load cognitive survival breakouts.
              </p>
              <button
                onClick={handleQuickSurgeInitialize}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-2xl font-sans text-xs font-bold tracking-widest transition-all hover:scale-[1.01] cursor-pointer"
              >
                INITIALIZE SURGE SPRINT
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
