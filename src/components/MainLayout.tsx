import React, { useEffect, useState } from 'react';
import { Gamepad2, Settings, UserCircle, LogOut, ArrowUpCircle, Sparkles } from 'lucide-react';
import CoreView from './game/CoreView';
import Shop from './game/Shop';
import GlobalChat from './social/GlobalChat';
import Leaderboards from './social/Leaderboards';
import GameLoop from './game/GameLoop';
import World3D from './game/World3D';
import PrestigeModal from './game/PrestigeModal';
import SettingsModal from './SettingsModal';
import PetsModal from './PetsModal';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';
import { initAudio, playBgm, setMasterVolume } from '../lib/audio';

export default function MainLayout() {
  const { username, avatar, level, syncDB, coins, state } = useGameStore();
  const [activePanel, setActivePanel] = useState<'chat' | 'leaderboard'>('leaderboard');
  const [showPrestige, setShowPrestige] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPets, setShowPets] = useState(false);

  const canPrestige = coins >= 10000000;

  useEffect(() => {
    initAudio();
    const handleInteraction = () => {
      // Browsers require interaction before playing audio
      playBgm('void');
      if (state.settings?.masterVolume !== undefined) {
         setMasterVolume(state.settings.masterVolume);
      }
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
     if (state.settings?.muted) {
        setMasterVolume(0);
     } else {
        setMasterVolume(state.settings?.masterVolume ?? 1);
     }
  }, [state.settings?.muted, state.settings?.masterVolume]);

  const handleSignOut = async () => {
    await syncDB();
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#050208] text-white overflow-hidden font-sans select-none relative" style={{ background: 'radial-gradient(circle at 50% 50%, #1a0b2e 0%, #050208 100%)' }}>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <GameLoop />
      
      {/* 3D World Background */}
      <World3D />
      
      {/* Top Left Floating Actions */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button 
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 bg-black/60 border border-white/20 rounded-full flex items-center justify-center backdrop-blur text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowPets(true)}
          className="px-4 h-10 bg-black/60 border border-fuchsia-500/30 rounded-full flex items-center justify-center backdrop-blur text-fuchsia-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest hover:bg-fuchsia-600/20"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Companions
        </button>
      </div>

      {/* Prestige Button - Visible if near or can prestige */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
         <button 
           onClick={() => setShowPrestige(true)}
           className={`px-8 py-3 rounded-full font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${canPrestige ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:scale-105 animate-pulse' : 'bg-black/60 border border-white/20 text-gray-500 backdrop-blur hover:bg-white/10'}`}
         >
           <ArrowUpCircle className="w-5 h-5" />
           {canPrestige ? 'Ascend into Void' : 'Prestige'}
         </button>
      </div>

      {/* Left Sidebar - Shop & Upgrades */}
      <div className="relative z-10 h-full pointer-events-auto">
        <Shop />
      </div>

      {/* Center - Core Gameplay (Make it transparent to see 3D) */}
      <div className="flex-1 pointer-events-none z-10 relative">
         {/* We wrap CoreView to control pointer events so we can pan the 3D camera */}
         <div className="absolute inset-0 pointer-events-auto bg-transparent flex items-center justify-center">
           <CoreView />
         </div>
      </div>

      {/* Right Sidebar - Social & Leaderboards */}
      <div className="flex flex-col h-full border-l border-white/10 w-80 bg-black/40 z-10 backdrop-blur-xl relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] pointer-events-auto">
        {/* User Mini Profile Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-lg"></div>
              <img src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`} alt="Avatar" className="w-10 h-10 rounded-lg border border-white/20 bg-black/60 relative z-10" />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)] text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 z-20">
                {level}
              </div>
            </div>
            <div>
              <div className="font-bold text-[13px] tracking-wide text-cyan-50">{username}</div>
              <div className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-widest font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" /> Online
              </div>
            </div>
          </div>
          
          <button onClick={handleSignOut} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-red-400" title="Save & Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Switcher */}
        <div className="flex border-b border-white/10 bg-black/40 backdrop-blur-md">
          <button 
            onClick={() => setActivePanel('leaderboard')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === 'leaderboard' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Rankings
          </button>
          <button 
            onClick={() => setActivePanel('chat')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activePanel === 'chat' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Terminal
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden relative">
          {activePanel === 'leaderboard' ? <Leaderboards /> : <GlobalChat />}
        </div>
      </div>
      
      {showPrestige && <PrestigeModal onClose={() => setShowPrestige(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showPets && <PetsModal onClose={() => setShowPets(false)} />}
    </div>
  );
}
