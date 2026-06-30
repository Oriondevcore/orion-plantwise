'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app';
import { Leaf, Mail, Lock, User, X } from 'lucide-react';

export function AuthDialog() {
  const { login, register, showAuth, setShowAuth } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!showAuth) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const errMsg = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name || email.split('@')[0]);
      if (errMsg) setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="garden-card relative w-full max-w-sm rounded-2xl p-6">
        <button
          onClick={() => setShowAuth(false)}
          className="absolute right-4 top-4 text-white/40 hover:text-white/70"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 shadow-lg shadow-emerald-500/20">
            <Leaf size={28} className="text-white" />
          </div>
          <h2 className="mt-1 text-xl font-bold text-white">Orion PlantWise</h2>
          <p className="text-sm text-white/50">
            {mode === 'login' ? 'Welcome back, gardener' : 'Start your garden journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="garden-cta w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/30">
          {mode === 'login' ? (
            <>New here?{' '}<button onClick={() => { setMode('register'); setError(null); }} className="text-emerald-400 hover:underline">Create an account</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => { setMode('login'); setError(null); }} className="text-emerald-400 hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
