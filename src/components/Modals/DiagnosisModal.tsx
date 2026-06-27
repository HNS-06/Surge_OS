import React from 'react';
import { useApp } from '../../context/AppContext';

export default function DiagnosisModal() {
  const {
    isDiagnosisModalOpen,
    setIsDiagnosisModalOpen,
    diagnosingTask,
    diagnosisStep,
    selectedTriggerCode,
    diagnosisResult,
    handleSelectTriggerOption,
    handleGenerateSurvivalPlan
  } = useApp();

  if (!isDiagnosisModalOpen || !diagnosingTask) return null;

  const renderTriggerOption = (id: string, title: string, desc: string) => {
    const isActive = selectedTriggerCode === id;
    return (
      <button
        key={id}
        onClick={() => handleSelectTriggerOption(id, title, desc)}
        className={`group text-left p-6 border transition-all duration-150 flex flex-col gap-4 rounded-2xl hover:border-indigo-500/50 hover:bg-zinc-950/40 cursor-pointer ${
          isActive ? 'border-amber-500 bg-amber-500/5 shadow-lg' : 'border-zinc-800 bg-zinc-900/40'
        }`}
      >
        <span className="font-sans text-xs text-zinc-500 group-hover:text-indigo-400 font-bold">0{id}</span>
        <p className="font-sans font-bold text-base text-white">{title}</p>
        <p className="text-xs text-zinc-400 font-medium">{desc}</p>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 flex flex-col relative rounded-[2rem] max-h-[90vh] overflow-hidden shadow-2xl">
        
        <div className="w-full h-1.5 bg-zinc-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
            style={{ width: diagnosisStep === 1 ? '33.33%' : diagnosisStep === 2 ? '66.66%' : '100%' }}
          ></div>
        </div>

        <div className="p-8 pb-5 flex justify-between items-start">
          <div>
            <p className="font-sans text-[10px] font-bold text-indigo-400 tracking-wider mb-2 uppercase" id="step-counter">
              {diagnosisStep === 1 
                ? "STEP 01 OF 03: TRIGGER IDENTIFICATION" 
                : diagnosisStep === 2 
                  ? "STEP 02 OF 03: ANALYZING ROOT COGNITIVE OBSTACLE" 
                  : "STEP 03 OF 03: PERSONALIZED BREAKOUT INSTRUCTIONS"
              }
            </p>
            <h2 className="font-sans text-xl font-bold text-white max-w-2xl leading-snug tracking-tight uppercase">
              {diagnosisStep === 1 && `When you think about "${diagnosingTask.name}" right now, you feel:`}
              {diagnosisStep === 2 && "SYSTEM CALIBRATION AND COGNITIVE PROFILING ACTIVE..."}
              {diagnosisStep === 3 && `Your Survival Plan for "${diagnosingTask.name}" is formulated:`}
            </h2>
          </div>
          <button 
            onClick={() => setIsDiagnosisModalOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="p-8 pt-0 flex-1 overflow-y-auto custom-scrollbar">
          
          {diagnosisStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTriggerOption(
                "1", 
                "Confused about where to start", 
                "The sequence is unclear. The first physical domino has not been identified."
              )}
              {renderTriggerOption(
                "2", 
                "Overwhelmed by how much it is", 
                "The scope is massive. It feels like climbing a vertical mountain cliff without oxygen."
              )}
              {renderTriggerOption(
                "3", 
                "Distracted and can't focus", 
                "Internal noise or environmental friction is preventing cognitive lock-in."
              )}
              {renderTriggerOption(
                "4", 
                "Like it might not actually matter", 
                "Low value perception. The effort-to-reward ratio feels misaligned."
              )}
            </div>
          )}

          {diagnosisStep === 2 && (
            <div className="border border-dashed border-zinc-800 p-12 text-center flex flex-col items-center justify-center gap-6 bg-zinc-950/40 rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-indigo-400 animate-spin">analytics</span>
              <div>
                <p className="font-sans text-xs tracking-wider text-indigo-400 uppercase font-bold animate-pulse">
                  CALIBRATING ROOT CAUSE VIA SURGE LOGIC...
                </p>
                <p className="text-xs text-zinc-400 mt-2 font-sans font-medium">
                  Formulating hyper-specific physical step parameters to bypass cognitive resistance.
                </p>
              </div>
            </div>
          )}

          {diagnosisStep === 3 && diagnosisResult && (
            <div className="space-y-6">
              <div className="border border-zinc-800 p-5 bg-zinc-950/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl">
                <div>
                  <span className="font-sans text-[9px] font-bold bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-lg uppercase">
                    BLOCK DETECTED: {diagnosisResult.blockType}
                  </span>
                  <h3 className="font-sans font-bold text-base text-white mt-2">
                    {diagnosisResult.diagnosisTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5 max-w-2xl font-medium">
                    {diagnosisResult.diagnosisText}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="font-sans text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {diagnosisResult.interventionLabel}
                </h4>
                <div className="space-y-2">
                  {diagnosisResult.interventionSteps.map((stepText: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 border border-zinc-800 bg-zinc-950/20 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-sans text-[10px] text-indigo-400 font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="font-sans text-xs text-white leading-normal self-center font-medium">
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="p-8 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-950/20">
          <div className="flex items-center gap-3 select-none">
            <div className="w-11 h-11 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-indigo-400 text-xl font-bold">info</span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug max-w-xs font-sans font-medium">
              This diagnosis calibrates SURGE focus parameters to bypass cognitive avoidance triggers.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsDiagnosisModalOpen(false)}
              className="flex-grow md:flex-initial px-6 py-3.5 border border-zinc-800 text-zinc-400 hover:text-white font-sans text-xs font-bold tracking-wider uppercase rounded-xl cursor-pointer"
            >
              CANCEL
            </button>
            {diagnosisStep === 3 && (
              <button 
                onClick={handleGenerateSurvivalPlan}
                className="flex-grow md:flex-initial px-8 py-3.5 bg-amber-500 text-zinc-950 font-sans text-xs font-bold tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all rounded-xl cursor-pointer"
              >
                GENERATE SURVIVAL PLAN
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
