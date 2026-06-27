import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function ScheduleView() {
  const { tasks, suggestions, handleAcceptSuggestion, handleRejectSuggestion, handleOptimizeFullWeek } = useApp();

  const weekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const weekDates = useMemo(() => {
    return dayNames.map((name, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        name,
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase(),
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  }, [weekStart]);

  // Re-evaluate the current time position every minute so the red marker tracks live
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const currentTimePosition = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = (hours - 6) * 60 + minutes;
    const totalSlotMinutes = 19 * 60;
    return Math.max(0, Math.min(100, (totalMinutes / totalSlotMinutes) * 100));
  }, [now]);

  const currentTimeLabel = useMemo(() => {
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} SCAN`;
  }, [now]);

  const windowLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const startStr = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    return `WINDOW: ${startStr} - ${endStr}`;
  }, [weekStart]);

  const dailyLoadScores = useMemo(() => {
    const scores = Array(7).fill(0);
    tasks.forEach(t => {
      if (t.day !== undefined && t.day >= 0 && t.day < 7) {
        scores[t.day] += t.durationHours || t.estimatedHours || 0;
      }
    });
    return scores;
  }, [tasks]);

  const incompleteTasks = tasks.filter(t => !t.completed && t.day !== undefined && t.startHour !== undefined);
  const incompleteSuggestions = suggestions;

  return (
    <div className="absolute inset-0 grid grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar bg-[#050505]">

      {/* Main Timeline */}
      <div className="col-span-12 lg:col-span-9 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 flex flex-col h-full shadow-lg relative">

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-sans text-xl font-bold text-white tracking-tight uppercase">WEEKLY OPS TIMELINE</h1>
            <p className="font-sans text-xs text-zinc-500 mt-0.5 font-medium">{windowLabel} | STATUS: HIGH DENSITY</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2 font-sans text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all rounded-xl cursor-pointer" title="Previous week">
              <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
              PREV
            </button>
            <button className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-4 py-2 font-sans text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white transition-all rounded-xl cursor-pointer" title="Next week">
              NEXT
              <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="relative bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden rounded-2xl flex-1">

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-800 text-center font-sans text-xs font-semibold">
                <div className="p-4 border-r border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-zinc-400 text-sm">schedule</span>
                </div>
                {weekDates.map((d, i) => {
                  const score = dailyLoadScores[i];
                  let bgClass = "bg-zinc-900/10";
                  let borderClass = "border-t-2 border-t-transparent";
                  let isOverload = false;

                  if (score > 0 && score <= 3) {
                    bgClass = "bg-emerald-500/5";
                    borderClass = "border-t-2 border-t-emerald-500";
                  } else if (score > 3 && score <= 6) {
                    bgClass = "bg-amber-500/10";
                    borderClass = "border-t-2 border-t-amber-500";
                  } else if (score > 6) {
                    bgClass = "bg-red-500/15";
                    borderClass = "border-t-2 border-t-red-500";
                    isOverload = true;
                  }

                  return (
                    <div
                      key={i}
                      className={`p-4 border-r border-zinc-800 ${borderClass} ${bgClass} ${i === 6 ? 'border-r-0' : ''} flex flex-col items-center justify-center`}
                    >
                      <p className={`tracking-wider ${d.isToday ? 'text-indigo-400 font-bold' : 'text-zinc-400'}`}>{d.name}</p>
                      <p className={`text-[10px] mt-0.5 ${d.isToday ? 'text-indigo-400 font-semibold' : 'text-zinc-500 font-normal'}`}>{d.label}</p>
                      {isOverload && (
                        <span className="font-mono text-[8px] text-red-500 font-bold mt-1 tracking-wider uppercase">OVERLOAD</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative custom-scrollbar technical-grid-bg h-[550px] overflow-x-auto">
            <div className="min-w-[800px] h-full relative">

              <div className="absolute left-0 w-full h-0.5 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ top: `${currentTimePosition}%` }}>
                <div className="absolute -left-1.5 -top-2.5 bg-red-500 text-white px-2 py-0.5 font-mono text-[9px] font-bold rounded-lg">
                  {currentTimeLabel}
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr]">
                <div className="border-r border-zinc-800 bg-zinc-900/20 text-center text-[10px] font-mono text-zinc-500 select-none">
                  {Array.from({ length: 19 }, (_, i) => {
                    const hr = 6 + i;
                    const hrString = `${String(hr).padStart(2, '0')}:00`;
                    return (
                      <div key={hr} className="h-16 border-b border-zinc-800/20 flex items-center justify-center">
                        {hrString}
                      </div>
                    );
                  })}
                </div>

                <div className="relative h-full grid grid-cols-7">

                  {Array.from({ length: 6 }, (_, idx) => (
                    <div key={idx} className="absolute h-full border-r border-zinc-800/20" style={{ left: `${(idx + 1) * (100 / 7)}%` }}></div>
                  ))}

                  {incompleteTasks.map(task => {
                    const topPx = (task.startHour! - 6) * 64;
                    const heightPx = (task.durationHours || 1.5) * 64;
                    const colWidthPct = 100 / 7;
                    const leftPct = task.day! * colWidthPct;
                    const isCritical = task.type === "EXAM";

                    return (
                      <div
                        key={task.id}
                        className={`absolute p-2.5 border-l-4 z-10 select-none overflow-hidden hover:brightness-110 transition-all rounded-lg cursor-pointer ${
                          isCritical
                            ? 'bg-red-500/10 border-red-500 text-red-400'
                            : 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        }`}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `${leftPct}%`,
                          width: `${colWidthPct - 0.2}%`
                        }}
                        title={`${task.name} — ${task.subject}`}
                      >
                        <p className="font-sans text-[10px] font-bold tracking-wider uppercase truncate">
                          {task.name}
                        </p>
                        <p className="font-sans text-[9px] leading-tight text-zinc-400 mt-0.5 truncate">
                          {task.subject}
                        </p>
                      </div>
                    );
                  })}

                  {incompleteSuggestions.map(sug => {
                    const topPx = (sug.startHour - 6) * 64;
                    const heightPx = sug.durationHours * 64;
                    const colWidthPct = 100 / 7;
                    const leftPct = sug.day * colWidthPct;

                    return (
                      <div
                        key={sug.id}
                        onClick={() => handleAcceptSuggestion(sug)}
                        className="absolute border-2 border-dashed border-zinc-800 bg-zinc-900/10 hover:border-indigo-500/50 p-2.5 z-10 cursor-pointer opacity-60 hover:opacity-100 transition-opacity flex flex-col justify-between rounded-lg"
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `${leftPct}%`,
                          width: `${colWidthPct - 0.2}%`
                        }}
                        title={`Accept suggestion: ${sug.title}`}
                      >
                        <div>
                          <p className="font-sans text-[9px] font-bold text-zinc-500 tracking-widest uppercase">
                            SUGGESTED
                          </p>
                          <p className="font-sans text-[9px] text-indigo-400 font-semibold mt-0.5 truncate">
                            {sug.title}
                          </p>
                        </div>
                        <span className="font-sans text-[9px] text-indigo-400 text-right block uppercase font-bold">ACCEPT</span>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="col-span-12 lg:col-span-3 bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-6 flex flex-col h-full shadow-lg">
        <div className="mb-6 flex-grow flex flex-col overflow-hidden">
          <h3 className="font-sans text-xs font-bold text-indigo-400 border-b border-zinc-800/60 pb-3 mb-4 flex items-center justify-between">
            AI SUGGESTED SLOTS
            <span className="material-symbols-outlined text-lg text-indigo-400">auto_awesome</span>
          </h3>

          <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {suggestions.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
                <span className="material-symbols-outlined text-zinc-600 text-3xl mb-1">checklist_reveal</span>
                <p className="font-sans text-[10px] text-zinc-500 uppercase font-semibold">ALL SUGGESTIONS INTEGRATED</p>
              </div>
            ) : (
              suggestions.map(sug => (
                <div key={sug.id} className="bg-zinc-950 p-4 border border-zinc-800 hover:border-indigo-500/50 transition-all rounded-2xl relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-sans text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      sug.type === 'HIGH_EFFICIENCY' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {sug.type}
                    </span>
                    <span className="font-sans text-[10px] text-zinc-500 font-bold">{sug.confidence}% CONF</span>
                  </div>
                  <p className="font-sans font-bold text-xs leading-tight text-white">{sug.title}</p>
                  <p className="font-sans text-[10px] text-zinc-500 mt-1">{sug.timeString}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAcceptSuggestion(sug)}
                      className="flex-grow bg-indigo-600 text-white font-sans text-[10px] font-bold py-2 hover:bg-indigo-500 transition-all rounded-xl cursor-pointer"
                    >
                      ACCEPT SLOT
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(sug.id)}
                      className="w-9 border border-zinc-800 hover:bg-zinc-900 hover:text-red-400 transition-colors flex items-center justify-center rounded-xl cursor-pointer"
                      title="Reject suggestion"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-red-950/15 border border-red-900/30 p-4 mb-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-red-400 text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-sans text-[10px] font-bold text-red-400 tracking-wider">SURGE WARNING</span>
            </div>
            <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
              System predicts 85% burnout probability for THU based on current load. Suggest redistributing "Research" task.
            </p>
          </div>

          <button
            onClick={handleOptimizeFullWeek}
            className="w-full bg-zinc-950 border border-zinc-800 py-3.5 font-sans text-xs font-bold text-zinc-300 tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all rounded-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-indigo-400">rocket_launch</span>
            OPTIMIZE FULL WEEK
          </button>
        </div>
      </aside>

    </div>
  );
}
