import { useApp } from '../../context/AppContext';

export default function OnboardingView() {
  const {
    subjects,
    onboardingSubject,
    setOnboardingSubject,
    onboardingSemester,
    setOnboardingSemester,
    handleAddOnboardingSubject,
    handleRemoveSubject,
    handleFinishOnboarding,
    setCurrentTab
  } = useApp();

  return (
    <div className="flex-1 technical-grid-dense flex flex-col items-center justify-center relative p-4 sm:p-8 py-12">
      <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-6 sm:p-10 relative rounded-[2rem] shadow-2xl">

        <div className="mb-8">
          <span className="font-sans text-xs font-bold text-zinc-500 tracking-widest block mb-2">STEP 2 OF 3</span>
          <div className="w-full bg-zinc-800 h-1 flex gap-1 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3"></div>
            <div className="h-full bg-indigo-500 w-1/3"></div>
            <div className="h-full bg-zinc-700 w-1/3"></div>
          </div>
        </div>

        <header className="mb-8">
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight mb-2">LOAD YOUR SUBJECTS</h1>
          <p className="font-sans text-sm text-zinc-400">INPUT SYSTEM ENTITIES FOR SEMESTER TRACKING.</p>
        </header>

        <section className="space-y-8">
          <div className="space-y-3">
            <label className="font-sans text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
              Add New Course / Subject
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="E.G. QUANTUM COMPUTING"
                type="text"
                value={onboardingSubject}
                onChange={(e) => setOnboardingSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOnboardingSubject()}
              />
              <button
                onClick={handleAddOnboardingSubject}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                ADD <span className="material-symbols-outlined text-sm font-bold">add</span>
              </button>
            </div>
          </div>

          <div className="min-h-[110px] border border-dashed border-zinc-800 rounded-2xl p-4 bg-zinc-950/40">
            <div className="flex flex-wrap gap-3">
              {subjects.length === 0 ? (
                <div className="font-sans text-xs text-zinc-500 italic py-2">NO SUBJECTS LOADED. Add some above.</div>
              ) : (
                subjects.map((subj) => (
                  <div key={subj} className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 rounded-full group">
                    <span className="font-sans text-xs text-zinc-200">{subj}</span>
                    <button
                      onClick={() => handleRemoveSubject(subj)}
                      className="material-symbols-outlined text-xs text-zinc-500 hover:text-red-400 transition-colors font-bold"
                    >
                      close
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-sans text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
              Current Academic Period
            </label>
            <div className="relative">
              <select
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-sm text-white appearance-none cursor-pointer focus:border-indigo-500 focus:outline-none"
                value={onboardingSemester}
                onChange={(e) => setOnboardingSemester(e.target.value)}
              >
                <option value="1">1ST SEMESTER</option>
                <option value="2">2ND SEMESTER</option>
                <option value="3">3RD SEMESTER</option>
                <option value="4">4TH SEMESTER</option>
                <option value="5">5TH SEMESTER</option>
                <option value="6">6TH SEMESTER</option>
                <option value="7">7TH SEMESTER</option>
                <option value="8">8TH SEMESTER</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-zinc-500">expand_more</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={() => setCurrentTab("overview")}
            className="flex items-center gap-2 font-sans text-xs font-bold text-zinc-400 hover:text-white transition-colors py-2 group tracking-wider"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            BACK
          </button>
          <button
            onClick={handleFinishOnboarding}
            disabled={subjects.length === 0}
            className="flex items-center gap-2 font-sans text-xs font-bold bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            NEXT
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </footer>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8 font-sans text-[10px] text-zinc-500 uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          SYSTEM: STANDBY
        </div>
        <div>LOAD: 12%</div>
        <div>ENCRYPTION: AES-256</div>
      </div>
    </div>
  );
}
