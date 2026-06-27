import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AuthView() {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const success = await login(email, password);
      if (!success) setError('Invalid credentials');
    } else {
      if (!name.trim()) { setError('Name is required'); return; }
      const success = await register(email, password, name);
      if (!success) setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4">
            S
          </div>
          <h1 className="font-sans text-2xl font-bold text-white tracking-tight uppercase">SURGE OS</h1>
          <p className="font-sans text-xs text-zinc-500 mt-1.5 uppercase tracking-widest">Tactical Productivity Command Center</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-8 shadow-lg">
          <div className="flex border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 font-sans text-xs font-bold tracking-wider transition-all ${
                isLogin ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 font-sans text-xs font-bold tracking-wider transition-all ${
                !isLogin ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="ENTER YOUR NAME..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="ENTER EMAIL..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="ENTER PASSWORD..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl font-sans text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-4 tracking-wider shadow-lg transition-all active:scale-[0.98] rounded-xl cursor-pointer"
            >
              {isLogin ? 'INITIALIZE SESSION' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
