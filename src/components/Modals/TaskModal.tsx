import React from 'react';
import { useApp } from '../../context/AppContext';
import { TaskType } from '../../types';

export default function TaskModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    subjects,
    tasks,
    newTaskName,
    setNewTaskName,
    newTaskSubject,
    setNewTaskSubject,
    newTaskType,
    setNewTaskType,
    newTaskDate,
    setNewTaskDate,
    newTaskTime,
    setNewTaskTime,
    newTaskEstHours,
    setNewTaskEstHours,
    newTaskBlock,
    setNewTaskBlock,
    newSubjectInline,
    setNewSubjectInline,
    showAddSubjectInline,
    setShowAddSubjectInline,
    saveState,
    handleAddNewTask,
    token,
    showToast,
  } = useApp();

  if (!isTaskModalOpen) return null;

  const handleSaveInlineSubject = async () => {
    if (!newSubjectInline.trim()) return;
    const code = newSubjectInline.toUpperCase();

    if (token) {
      try {
        const response = await fetch('/api/data/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name: code })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const updatedSubjects = await response.json();
        if (Array.isArray(updatedSubjects)) {
          // Pass current tasks to avoid wiping them
          saveState(updatedSubjects, tasks);
        }
      } catch (e) {
        console.error("Failed to add subject via API", e);
      }
    } else {
      if (!subjects.includes(code)) {
        // Pass current tasks to avoid wiping them
        saveState([...subjects, code], tasks);
      }
    }

    setNewTaskSubject(code);
    setNewSubjectInline("");
    setShowAddSubjectInline(false);
    showToast(`Subject "${code}" added`, "success");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-zinc-900 border border-zinc-800 shadow-2xl relative flex flex-col rounded-[2rem] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3 select-none">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
            <h2 className="font-sans text-xs font-bold text-white tracking-widest uppercase">ADD NEW TASK</h2>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleAddNewTask} className="p-6 space-y-5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 flex justify-between uppercase tracking-wider">
              Task Name
              <span className="opacity-50 text-[9px] text-zinc-500 font-semibold">[ REQUIRED ]</span>
            </label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="ENTER TASK NAME..."
              type="text"
              required
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subject / Course</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                value={newTaskSubject}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setShowAddSubjectInline(true);
                  } else {
                    setNewTaskSubject(e.target.value);
                  }
                }}
              >
                <option value="" className="bg-zinc-900">-- SELECT SUBJECT --</option>
                {subjects.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                <option value="__add_new__" className="bg-zinc-900">+ Add Custom Subject</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">expand_more</span>
            </div>

            {showAddSubjectInline && (
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-grow bg-zinc-950 border border-red-500/30 rounded-xl px-3 py-1.5 font-sans text-xs text-white focus:outline-none"
                  placeholder="ENTER NEW COURSE CODE"
                  value={newSubjectInline}
                  onChange={(e) => setNewSubjectInline(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSaveInlineSubject}
                  className="bg-indigo-600 text-white font-sans text-[10px] px-3 py-1.5 font-bold rounded-xl cursor-pointer hover:bg-indigo-500 transition-colors"
                >
                  SAVE
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Task Type</label>
            <div className="grid grid-cols-4 border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden">
              {(['EXAM', 'ASSIGNMENT', 'SUBMISSION', 'PROJECT'] as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewTaskType(t)}
                  className={`py-3 font-sans text-[9px] font-bold transition-all border-r border-zinc-800/60 last:border-r-0 cursor-pointer ${
                    newTaskType === t
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Deadline Date</label>
              <input
                type="date"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Time</label>
              <input
                type="time"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Estimated Hours</label>
            <div className="flex border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setNewTaskEstHours(prev => Math.max(1, prev - 1))}
                className="px-4 py-3 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800 cursor-pointer"
                title="Decrease hours"
              >
                <span className="material-symbols-outlined text-sm font-bold">remove</span>
              </button>
              <input
                type="number"
                className="w-full bg-transparent border-none text-center font-sans font-bold text-base text-white focus:ring-0 focus:outline-none"
                value={newTaskEstHours}
                onChange={(e) => setNewTaskEstHours(parseInt(e.target.value) || 1)}
              />
              <button
                type="button"
                onClick={() => setNewTaskEstHours(prev => Math.min(99, prev + 1))}
                className="px-4 py-3 text-zinc-400 hover:text-white transition-colors border-l border-zinc-800 cursor-pointer"
                title="Increase hours"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Block Prediction (Optional)</label>
            <div className="grid grid-cols-4 gap-2">
              {(['FOG', 'FEAR', 'FRICTION', 'FAKE'] as const).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setNewTaskBlock(prev => prev === b ? null : b)}
                  className={`py-2 font-sans text-[10px] border tracking-wider font-semibold transition-all rounded-xl cursor-pointer ${
                    newTaskBlock === b
                      ? 'border-amber-500 text-amber-500 bg-amber-500/5 shadow-lg'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white bg-zinc-950/20'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-4 tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">radar</span>
              ADD TO RADAR
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="font-sans text-[10px] text-zinc-500 hover:text-zinc-300 tracking-wider uppercase underline underline-offset-4 decoration-zinc-800 cursor-pointer"
              >
                Cancel Mission
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
