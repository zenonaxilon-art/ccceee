import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ArrowUpCircle, X } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { playSfx, playBgm } from '../../lib/audio';

export default function PrestigeModal({ onClose }: { onClose: () => void }) {
  const { coins, prestige, prestiges, state } = useGameStore();

  const reqCoins = 10000000;
  const progress = Math.min(100, (coins / reqCoins) * 100);
  const coinsEarned = state.coinsEarnedThisRun || coins;
  const tokensEarned = Math.floor(Math.sqrt(coinsEarned / 10000000));
  const canPrestige = coins >= reqCoins;

  const handlePrestige = () => {
    if (!canPrestige) return;
    
    // Animation
    confetti({
      particleCount: 200,
      spread: 160,
      colors: ['#a855f7', '#22d3ee', '#fbbf24']
    });

    // Dramatic flash handled here simply, in a real one we'd use a portal or context
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.backgroundColor = 'white';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 2s ease-out';
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => document.body.removeChild(flash), 2000);
    }, 100);

    prestige();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0a0510] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 relative">Void Ascension</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors relative">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 relative">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Ascension Power</div>
            <div className="text-4xl font-black italic text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
               +{formatNumber((prestiges * 5) + (tokensEarned * 5))}%
            </div>
            <div className="text-[10px] text-cyan-200 mt-2 font-mono">Permanent Global Multiplier</div>
          </div>

          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
             <div className="flex justify-between text-xs font-mono font-bold">
               <span className="text-gray-400">Current Coins</span>
               <span className="text-yellow-400">{formatNumber(coins)}</span>
             </div>
             <div className="flex justify-between text-xs font-mono font-bold">
               <span className="text-gray-400">Earned This Run</span>
               <span className="text-yellow-400">{formatNumber(coinsEarned)}</span>
             </div>
             <div className="flex justify-between text-xs font-mono font-bold">
               <span className="text-gray-400">Tokens Awarded</span>
               <span className="text-cyan-400">+{formatNumber(tokensEarned)}</span>
             </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-gray-500">Required: {formatNumber(reqCoins)}</span>
              <span className="text-cyan-400">{progress.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button 
             onClick={handlePrestige}
             disabled={!canPrestige}
             className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-2 ${canPrestige ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_30px_rgba(147,51,234,0.5)] cursor-pointer' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'}`}
          >
            <ArrowUpCircle className="w-5 h-5" />
            Embrace the Void
          </button>
        </div>
      </div>
    </div>
  );
}
