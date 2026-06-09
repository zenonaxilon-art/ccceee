import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { X, Volume2, VolumeX, Music, Settings as SettingsIcon } from 'lucide-react';
import { setMasterVolume, playSfx } from '../lib/audio';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { state, updateSettings } = useGameStore();
  const settings = state.settings || { masterVolume: 1, musicVolume: 1, sfxVolume: 1, muted: false };

  const handleVolumeChange = (key: keyof typeof settings, value: number | boolean) => {
    updateSettings({ [key]: value });
    if (key === 'masterVolume') setMasterVolume(value as number);
    if (key === 'sfxVolume' && !settings.muted) playSfx('click', value as number);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0a0510] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-cyan-400" /> Options
          </h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Master Volume</label>
              <button 
                onClick={() => handleVolumeChange('muted', !settings.muted)}
                className="text-gray-500 hover:text-white"
              >
                {settings.muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              disabled={settings.muted}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Sound Effects */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sound Effects</label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              disabled={settings.muted}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Music */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Music className="w-3 h-3" /> Music Volume
              </label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleVolumeChange('musicVolume', parseFloat(e.target.value))}
              disabled={settings.muted}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
          
          <div className="pt-4 border-t border-white/5">
             <button onClick={() => playSfx('prestige', settings.sfxVolume)} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300">
               Test Audio
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
