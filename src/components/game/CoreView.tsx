import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatNumber } from '../../lib/utils';
import { LEVELS } from '../../constants/gameData';

export default function Core() {
  const { coins, cps, clickPower, clickCore, combo, level, experience, gems } = useGameStore();
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, text: string, crit: boolean }[]>([]);
  let pid = Math.random();

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const result = clickCore();
    
    // Calculate position for particle
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const id = pid++;
    setParticles(p => [...p, { id, x: clientX, y: clientY, text: `+${formatNumber(result.value)}`, crit: result.critical }]);
    
    setTimeout(() => {
      setParticles(p => p.filter(part => part.id !== id));
    }, 1000);
  };

  const reqExp = LEVELS.getRequiredExp(level);
  const expPercent = Math.min(100, (experience / reqExp) * 100);

  return (
    <div className="flex-1 min-w-[300px] h-full flex flex-col items-center justify-center relative overflow-hidden z-0">
      
      {/* Background Pulse Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] border border-white/5 rounded-full animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] border border-white/10 rounded-full"></div>
      </div>

      {/* Top Banner Stats */}
      <div className="absolute top-0 inset-x-0 p-6 flex flex-col items-center gap-1 z-10">
        <div className="text-4xl lg:text-5xl font-black text-white italic tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] uppercase">
          {formatNumber(coins)}
        </div>
        <div className="text-xs text-cyan-400 font-mono tracking-[0.5em] mt-1 uppercase">
          {formatNumber(cps)} CPS <span className="mx-2 opacity-50">•</span> {formatNumber(clickPower)} / CLK
        </div>
        <div className="mt-6 w-72 max-w-full">
          <div className="flex justify-between text-[11px] font-bold mb-1 tracking-widest uppercase">
            <span className="text-purple-400">Level {level}</span>
            <span className="text-gray-400 font-mono">{formatNumber(experience)} / {formatNumber(reqExp)}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-300"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Core Button */}
      <div className="relative group cursor-pointer z-10" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
        <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full scale-125 opacity-50 group-active:scale-95 transition-all"></div>
        <div className="w-64 h-64 rounded-full bg-gradient-to-b from-cyan-400 via-purple-600 to-black p-1 shadow-[0_0_80px_rgba(34,211,238,0.3)] group-active:scale-95 transition-transform duration-[50ms]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.4),transparent_70%)]"></div>
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/20 animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite_reverse]">
              <div className="w-48 h-48 rounded-full border border-cyan-500/20"></div>
            </div>
            <div className="absolute flex flex-col items-center z-10">
              <span className="text-6xl drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">💎</span>
            </div>
          </div>
        </div>
        
        {combo > 5 && (
          <div className="absolute -right-12 top-10 text-xl font-mono font-black italic text-purple-400 drop-shadow-[0_0_10px_rgba(147,51,234,0.8)] animate-pulse">
            x{combo}!
          </div>
        )}
      </div>

      <div className="absolute bottom-28 flex gap-4 z-10">
        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-center min-w[100px]">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Combo Max</div>
          <div className="text-2xl font-black font-mono italic text-purple-400">100</div>
        </div>
        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-center min-w-[100px]">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Crit Chance</div>
          <div className="text-2xl font-black font-mono italic text-cyan-400">5.0%</div>
        </div>
      </div>

      {/* Floating Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute pointer-events-none animate-float-up font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-50 ${p.crit ? 'text-purple-300 font-black italic scale-150' : 'text-cyan-200'}`}
          style={{ left: p.x - 20, top: p.y - 20 }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
