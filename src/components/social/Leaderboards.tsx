import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { Profile } from '../../types/game';
import { motion, AnimatePresence } from 'motion/react';

export default function Leaderboards() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<'coins' | 'level' | 'prestiges'>('coins');
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLeaders = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order(category, { ascending: false })
      .limit(100);
    
    if (!error && data) {
      setPrevRanks(prev => {
         const newPrev: Record<string, number> = {};
         leaders.forEach((l, i) => {
            newPrev[l.id] = i;
         });
         return newPrev;
      });
      setLeaders(data);
      setLastRefreshed(new Date());
    }
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    fetchLeaders(true);

    const interval = setInterval(() => {
       fetchLeaders(false);
    }, 60000); // 60 seconds refresh

    return () => clearInterval(interval);
  }, [category]);

  const getRankChange = (id: string, currentIndex: number) => {
     if (prevRanks[id] === undefined) return null; // New entry
     const diff = prevRanks[id] - currentIndex;
     if (diff > 0) return { type: 'up', val: diff };
     if (diff < 0) return { type: 'down', val: Math.abs(diff) };
     return null;
  };

  return (
    <div className="bg-transparent w-full h-full flex flex-col relative overflow-hidden">
      <div className="p-3 border-b border-white/10 bg-white/5 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[11px] font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
            <Trophy className="w-3 h-3" /> Hall of Legends
          </h2>
          <div className="text-[9px] text-gray-500 font-mono flex items-center gap-1 group relative cursor-help">
            <Activity className="w-2.5 h-2.5 text-green-400 animate-pulse" /> Live
            <div className="absolute top-10 right-0 w-32 bg-black/90 p-2 text-xs border border-white/10 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Last sync: {lastRefreshed.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
          <button 
            onClick={() => setCategory('coins')}
            className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase tracking-widest transition-colors ${category === 'coins' ? 'bg-white/10 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Wealth
          </button>
          <button 
            onClick={() => setCategory('level')}
            className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase tracking-widest transition-colors ${category === 'level' ? 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Level
          </button>
          <button 
            onClick={() => setCategory('prestiges')}
            className={`flex-1 text-[10px] py-1.5 rounded-md font-bold uppercase tracking-widest transition-colors ${category === 'prestiges' ? 'bg-white/10 text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Prestige
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            <AnimatePresence mode="popLayout">
              {leaders.map((p, index) => {
                const change = getRankChange(p.id, index);
                const isNew = prevRanks[p.id] === undefined && Object.keys(prevRanks).length > 0;
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    key={p.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                  >
                    <div className="w-6 text-center font-bold text-[10px] text-gray-500 group-hover:text-cyan-400 transition-colors shrink-0">
                      {index === 0 ? <Crown className="w-4 h-4 text-yellow-500 mx-auto drop-shadow-md" /> : 
                       index === 1 ? <Medal className="w-4 h-4 text-gray-300 mx-auto" /> : 
                       index === 2 ? <Medal className="w-4 h-4 text-amber-600 mx-auto" /> : 
                       `#${index + 1}`}
                    </div>
                    <img src={p.avatar} alt="" className="w-8 h-8 rounded-md bg-black/40 border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-gray-200 truncate group-hover:text-white transition-colors">{p.username}</div>
                      <div className="text-[10px] font-mono mt-0.5">
                        {category === 'coins' && <span className="text-yellow-400/80">{formatNumber(p.coins)} Coins</span>}
                        {category === 'level' && <span className="text-cyan-400/80">Level {p.level}</span>}
                        {category === 'prestiges' && <span className="text-purple-400/80">{p.prestiges} Prestiges</span>}
                      </div>
                    </div>
                    
                    {/* Rank Change Indicator */}
                    <div className="w-8 shrink-0 flex justify-end">
                       {change?.type === 'up' && (
                          <div className="flex items-center text-[9px] font-mono font-bold text-green-400 bg-green-400/10 px-1 py-0.5 rounded">
                            <ArrowUp className="w-2.5 h-2.5 mr-0.5" />{change.val}
                          </div>
                       )}
                       {change?.type === 'down' && (
                          <div className="flex items-center text-[9px] font-mono font-bold text-red-400 bg-red-400/10 px-1 py-0.5 rounded">
                            <ArrowDown className="w-2.5 h-2.5 mr-0.5" />{change.val}
                          </div>
                       )}
                       {isNew && (
                          <div className="text-[8px] font-black uppercase text-yellow-400 bg-yellow-400/20 px-1 py-0.5 rounded tracking-widest border border-yellow-400/50 blink">
                             NEW
                          </div>
                       )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
