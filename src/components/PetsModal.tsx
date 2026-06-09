import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { X, Egg, Star, Sparkles } from 'lucide-react';
import { PETS } from '../constants/pets';
import confetti from 'canvas-confetti';
import { playSfx } from '../lib/audio';

// Simplified shortid
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function PetsModal({ onClose }: { onClose: () => void }) {
  const { coins, state, equipPet, unequipPet } = useGameStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'hatch'>('inventory');
  const [hatching, setHatching] = useState<boolean>(false);
  const [hatchedPet, setHatchedPet] = useState<any>(null);

  const inventoryPets = state.inventoryPets || [];
  const equippedPets = state.equippedPets || [];

  const handleHatch = () => {
    // Basic egg costs 10k
    // This is just a visual demo that updates state immediately but delays UI
    if (coins < 10000) return; // Need to actually deduct coins, we'd need a store action specifically.
    
    // For simplicity, let's just use useGameStore.setState if we don't have a specific action,
    // but the proper way is an action. We'll add it in useGameStore or just update the state here via a custom action.
    useGameStore.setState((prev) => ({ coins: prev.coins - 10000 }));
    
    setHatching(true);
    setHatchedPet(null);
    playSfx('click'); // Shake sound

    // Rare chance logic
    const rand = Math.random();
    let selectedId = 'p_bean';
    if (rand > 0.95) selectedId = 'p_phoenix';
    else if (rand > 0.8) selectedId = 'p_bot';
    else if (rand > 0.5) selectedId = 'p_mole';

    const pc = PETS.find(p => p.id === selectedId);

    setTimeout(() => {
      // Big explosion
      playSfx('hatch');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const newPet = { id: generateId(), petId: selectedId, level: 1, exp: 0 };
      
      useGameStore.setState((prev) => ({
        state: {
          ...prev.state,
          inventoryPets: [...(prev.state.inventoryPets || []), newPet]
        }
      }));

      setHatchedPet(pc);
      setHatching(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0a0510] border border-fuchsia-500/30 rounded-2xl shadow-[0_0_50px_rgba(217,70,239,0.2)] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Nexus Companions
          </h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-4">
          <button onClick={() => setActiveTab('inventory')} className={`pb-2 text-xs font-bold uppercase tracking-widest ${activeTab === 'inventory' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-gray-500 hover:text-gray-300'}`}>Inventory</button>
          <button onClick={() => setActiveTab('hatch')} className={`pb-2 text-xs font-bold uppercase tracking-widest ${activeTab === 'hatch' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-gray-500 hover:text-gray-300'}`}>Incubator</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
           {activeTab === 'inventory' && (
             <div>
               <div className="text-xs text-gray-500 font-mono mb-4">Equipped: {equippedPets.length} / 3</div>
               <div className="grid grid-cols-3 gap-4">
                 {inventoryPets.map(p => {
                    const conf = PETS.find(c => c.id === p.petId);
                    if (!conf) return null;
                    const isEquipped = equippedPets.includes(p.id);

                    return (
                      <div key={p.id} className={`p-4 rounded-xl border relative overflow-hidden transition-all ${isEquipped ? 'bg-fuchsia-900/20 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}>
                        <div className="text-4xl text-center mb-2 drop-shadow-md">{conf.emoji}</div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-white uppercase">{conf.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mb-2">Lv. {p.level} • {conf.rarity}</div>
                          {isEquipped ? (
                            <button onClick={() => unequipPet(p.id)} className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 rounded">Unequip</button>
                          ) : (
                            <button onClick={() => equipPet(p.id)} disabled={equippedPets.length >= 3} className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/40 rounded border border-fuchsia-500/30 disabled:opacity-50">Equip</button>
                          )}
                        </div>
                      </div>
                    )
                 })}
                 {inventoryPets.length === 0 && (
                   <div className="col-span-3 text-center py-12 text-gray-500 italic text-xs font-mono">No companions found. Visit the Incubator.</div>
                 )}
               </div>
             </div>
           )}

           {activeTab === 'hatch' && (
             <div className="flex flex-col items-center justify-center py-12">
               
               {!hatchedPet ? (
                 <div className="relative group">
                   {hatching && <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />}
                   <div className={`w-40 h-48 border-4 border-dashed rounded-[50%] bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(147,51,234,0.3)] transition-all ${hatching ? 'animate-bounce border-white shadow-[0_0_100px_rgba(255,255,255,0.8)]' : 'border-fuchsia-500/50'}`}>
                     🥚
                   </div>
                 </div>
               ) : (
                 <div className="text-center animate-bounce">
                    <div className="text-8xl drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] mb-4">{hatchedPet.emoji}</div>
                    <div className="text-2xl font-black text-fuchsia-400 uppercase tracking-widest">{hatchedPet.name}</div>
                    <div className="text-xs text-yellow-400 font-mono mt-1">{hatchedPet.rarity}</div>
                 </div>
               )}

               <div className="mt-12 text-center text-xs font-mono text-yellow-400 mb-4">10,000 Coins</div>
               <button 
                 onClick={handleHatch}
                 disabled={hatching || coins < 10000}
                 className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(217,70,239,0.5)] disabled:opacity-50 disabled:hover:scale-100"
               >
                 {hatching ? 'Generating Lifeform...' : (hatchedPet ? 'Hatch Another' : 'Initiate Incubation')}
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
