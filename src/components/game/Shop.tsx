import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BUILDINGS, UPGRADES } from '../../constants/gameData';
import { formatNumber } from '../../lib/utils';
import { Wrench, Zap, Lock } from 'lucide-react';

export default function Shop() {
  const { coins, state, buyBuilding, buyUpgrade } = useGameStore();
  const [tab, setTab] = React.useState<'buildings' | 'upgrades'>('buildings');

  return (
    <div className="flex-1 bg-black/40 border-r border-white/10 flex flex-col h-full max-w-sm backdrop-blur-xl shrink-0">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-purple-300">Command Center</h2>
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button 
            onClick={() => setTab('buildings')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all ${tab === 'buildings' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 border-transparent opacity-50'}`}
          >
            <Wrench className="w-3 h-3" /> Structures
          </button>
          <button 
            onClick={() => setTab('upgrades')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all ${tab === 'upgrades' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 border-transparent opacity-50'}`}
          >
            <Zap className="w-3 h-3" /> Research
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {tab === 'buildings' && BUILDINGS.map(b => {
          const count = state.buildings[b.id] || 0;
          const cost = Math.floor(b.baseCost * Math.pow(1.15, count));
          const canAfford = coins >= cost;

          return (
            <button
              key={b.id}
              onClick={() => buyBuilding(b.id)}
              disabled={!canAfford}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all relative overflow-hidden group ${canAfford ? 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10 cursor-pointer' : 'bg-black/40 border-dashed border-white/10 opacity-60 cursor-not-allowed'}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${canAfford ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                 <Wrench className="w-5 h-5 opacity-70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-white truncate">{b.name}</div>
                <div className="text-[10px] text-cyan-200 truncate">+{formatNumber(b.baseProduction)} Coins / sec</div>
                <div className="text-[10px] text-yellow-400 font-bold mt-1 tracking-wider">Cost: {formatNumber(cost)}</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className={`text-xs font-mono font-bold ${canAfford ? 'text-cyan-400' : 'text-gray-500'}`}>Lv. {count}</div>
              </div>
            </button>
          );
        })}

        {tab === 'upgrades' && UPGRADES.map(u => {
          const isOwned = state.upgrades.includes(u.id);
          const canAfford = coins >= u.cost;
          if (isOwned) return null; // hide owned ones

          return (
            <button
              key={u.id}
              onClick={() => buyUpgrade(u.id)}
              disabled={!canAfford || isOwned}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${(canAfford && !isOwned) ? 'bg-white/5 border-purple-500/30 hover:border-purple-500/60 hover:bg-white/10 cursor-pointer' : 'bg-black/40 border-dashed border-white/10 opacity-60 cursor-not-allowed'}`}
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-white truncate">{u.name}</div>
                <div className="text-[10px] text-purple-300 truncate">{u.description}</div>
                <div className="text-[10px] text-yellow-400 font-bold mt-1 tracking-wider">Cost: {formatNumber(u.cost)}</div>
              </div>
            </button>
          );
        })}

        {tab === 'upgrades' && state.upgrades.length === UPGRADES.length && (
          <div className="text-center p-6 bg-black/40 border border-dashed border-white/10 rounded-xl mt-4">
             <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold italic">All current research completed</div>
          </div>
        )}
      </div>
    </div>
  );
}
