/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import { useGameStore } from './store/useGameStore';
import AuthScreen from './components/Auth';
import MainLayout from './components/MainLayout';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { session, initSession, isSyncing } = useGameStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      initSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      initSession(session);
    });

    return () => subscription.unsubscribe();
  }, [initSession]);

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-slate-300">
        <h1 className="text-2xl font-bold mb-4 text-emerald-400">Database Connection Required</h1>
        <p className="max-w-md bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-xl leading-relaxed">
          Infinity Realms Online requires Supabase to function.
          <br /><br />
          Please set <code className="bg-slate-950 px-2 py-1 rounded text-pink-400 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-slate-950 px-2 py-1 rounded text-pink-400 font-mono">VITE_SUPABASE_ANON_KEY</code> in your environment or <code className="bg-slate-950 px-2 py-1 rounded text-pink-400 font-mono">.env.example</code> file.
          <br /><br />
          Also make sure to run the <code className="bg-slate-950 px-2 py-1 rounded text-pink-400 font-mono">supabase_schema.sql</code> file in your database SQL Editor!
        </p>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      <MainLayout />
      {/* Background Saving Indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 shadow-xl rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400 z-50">
          <Loader2 className="w-3 h-3 animate-spin" /> Syncing dimension...
        </div>
      )}
    </>
  );
}
