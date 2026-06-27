import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    setIsTaskModalOpen,
    handleQuickSurgeInitialize,
    handleOptimizeFullWeek,
    setCurrentTab,
    logout,
    token
  } = useApp();

  const commands = [
    {
      id: 'add_task',
      label: 'Add Task',
      icon: 'add_circle',
      shortcut: 'T',
      action: () => setIsTaskModalOpen(true),
    },
    {
      id: 'init_sprint',
      label: 'Initialize Surge Sprint',
      icon: 'bolt',
      shortcut: 'S',
      action: () => handleQuickSurgeInitialize(),
    },
    {
      id: 'optimize_week',
      label: 'Optimize Full Week',
      icon: 'psychology',
      shortcut: 'O',
      action: () => handleOptimizeFullWeek(),
    },
    {
      id: 'go_overview',
      label: 'Go to Overview',
      icon: 'dashboard',
      shortcut: 'G O',
      action: () => setCurrentTab('overview'),
    },
    {
      id: 'go_schedule',
      label: 'Go to Schedule',
      icon: 'calendar_today',
      shortcut: 'G S',
      action: () => setCurrentTab('schedule'),
    },
    {
      id: 'go_subjects',
      label: 'Go to Subjects',
      icon: 'school',
      shortcut: 'G U',
      action: () => setCurrentTab('onboarding'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout',
      shortcut: 'L',
      action: () => logout(),
    },
  ];

  // Only show logout if logged in (token exists)
  const availableCommands = token ? commands : commands.filter(c => c.id !== 'logout');

  const filteredCommands = availableCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredCommands.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  const handleCommandClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[slideUp_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/80">
          <span className="font-mono text-indigo-500 text-lg select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 outline-none text-zinc-100 text-sm placeholder-zinc-500 font-sans"
            placeholder="Type a command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 font-sans text-xs uppercase cursor-pointer"
          >
            [ESC]
          </button>
        </div>

        <div className="p-2 max-h-[300px] overflow-y-auto space-y-0.5 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-sans text-xs uppercase tracking-wider">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleCommandClick(cmd.action)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer font-sans text-xs font-bold tracking-wider uppercase transition-all duration-100 ${
                    isSelected
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-indigo-500">
                      {cmd.icon}
                    </span>
                    <span>{cmd.label}</span>
                  </div>
                  <kbd className="font-mono text-[9px] text-zinc-500 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded shadow">
                    {cmd.shortcut}
                  </kbd>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
