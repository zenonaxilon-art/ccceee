import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Gamepad2 } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        // Some systems require email confirmation, assuming turned off or handled gracefully
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050208] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" style={{ background: 'radial-gradient(circle at 50% 50%, #1a0b2e 0%, #050208 100%)' }}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative">
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <span className="text-3xl font-black text-white italic drop-shadow-md">∞</span>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-widest text-center uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Infinity Realms
          </h1>
          <p className="text-cyan-400 mt-2 text-[10px] tracking-[0.3em] font-mono uppercase">Online • Celestial Realm</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-600"
                placeholder="PRO_X77"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-600"
              placeholder="commander@earth.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-gray-600 tracking-widest"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/30 text-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Initialize Uplink' : 'Forge Identity')}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          {isLogin ? "New to the realm? " : "Already established? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 hover:text-white transition-colors font-bold uppercase tracking-widest ml-1 cursor-pointer"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
