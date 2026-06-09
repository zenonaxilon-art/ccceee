import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile, GameState, PetInstance } from '../types/game';
import { BUILDINGS, UPGRADES, LEVELS } from '../constants/gameData';
import { PETS } from '../constants/pets';
import { Session } from '@supabase/supabase-js';
import { playSfx } from '../lib/audio';

interface GameStore extends Profile {
  session: Session | null;
  cps: number;
  clickPower: number;
  combo: number;
  lastTick: number;
  isSyncing: boolean;
  
  // Actions
  initSession: (session: Session | null) => void;
  loadProfile: () => Promise<void>;
  syncDB: () => Promise<void>;
  
  // Game Actions
  clickCore: () => { critical: boolean; value: number };
  buyBuilding: (buildingId: string) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  prestige: () => void;
  equipPet: (instanceId: string) => void;
  unequipPet: (instanceId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  
  // Tick
  gameTick: () => void;
}

const DEFAULT_STATE: GameState = {
  buildings: {},
  upgrades: [],
  pets: [],
  inventoryPets: [],
  equippedPets: [],
  achievements: [],
  stats: { total_clicks: 0, highest_combo: 0, critical_clicks: 0 },
  settings: { masterVolume: 1, musicVolume: 1, sfxVolume: 1, muted: false },
};

export const useGameStore = create<GameStore>((set, get) => ({
  id: '',
  username: 'Guest',
  display_name: 'Guest',
  avatar: '',
  coins: 0,
  gems: 0,
  prestiges: 0,
  rebirths: 0,
  ascensions: 0,
  playtime: 0,
  level: 1,
  experience: 0,
  state: DEFAULT_STATE,
  
  session: null,
  cps: 0,
  clickPower: 1,
  combo: 0,
  lastTick: Date.now(),
  isSyncing: false,

  initSession: (session) => {
    set({ session });
    if (session) get().loadProfile();
  },

  loadProfile: async () => {
    const { session } = get();
    if (!session?.user) return;
    
    set({ isSyncing: true });
    
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      set({ isSyncing: false });
      return;
    }

    if (profile) {
      // Calculate offline progress
      const now = Date.now();
      const lastLogin = new Date(profile.last_login || now).getTime();
      const offlineSeconds = Math.max(0, (now - lastLogin) / 1000);
      
      const state: GameState = {
        ...DEFAULT_STATE,
        ...(profile.state || {})
      };
      
      // Calculate CPS to award offline progress
      let cps = 0;
      let globalMulti = 1;
      const upgrades = state.upgrades || [];
      UPGRADES.filter(u => upgrades.includes(u.id) && !u.targetBuilding).forEach(u => {
        globalMulti *= u.multiplier;
      });
      // Add Prestige Multiplier (e.g. 5% per prestige)
      globalMulti *= (1 + (profile.prestiges || 0) * 0.05);

      // Add Pet Multiplier (Global)
      state.equippedPets?.forEach(petId => {
        const petInstance = state.inventoryPets?.find(p => p.id === petId);
        if (petInstance) {
          const pConf = PETS.find(p => p.id === petInstance.petId);
          if (pConf && pConf.modifierType === 'global') {
            globalMulti *= (1 + (pConf.baseModifier * petInstance.level));
          }
        }
      });

      Object.entries(state.buildings || {}).forEach(([bId, amount]) => {
        const config = BUILDINGS.find(b => b.id === bId);
        if (config) {
          let bMulti = 1;
          UPGRADES.filter(u => upgrades.includes(u.id) && u.targetBuilding === bId).forEach(u => {
            bMulti *= u.multiplier;
          });

          // Pet Building Multiplier
          state.equippedPets?.forEach(petId => {
            const petInstance = state.inventoryPets?.find(p => p.id === petId);
            if (petInstance) {
              const pConf = PETS.find(p => p.id === petInstance.petId);
              if (pConf && pConf.modifierType === 'building' && pConf.targetBuilding === bId) {
                bMulti *= (1 + (pConf.baseModifier * petInstance.level));
              }
            }
          });

          cps += config.baseProduction * amount * bMulti;
        }
      });
      
      cps *= globalMulti;      
      const offlineCoins = offlineSeconds * cps;
      
      // Update store
      set({
        ...profile,
        coins: Number(profile.coins) + offlineCoins,
        state,
        cps,
        lastTick: Date.now(),
        isSyncing: false
      });
      
      // Update click power
      let clickPower = 1;
      UPGRADES.filter(u => upgrades.includes(u.id) && u.id.startsWith('u_click_')).forEach(u => {
        clickPower *= u.multiplier;
      });

      // Pet Click Multiplier
      state.equippedPets?.forEach(petId => {
        const petInstance = state.inventoryPets?.find(p => p.id === petId);
        if (petInstance) {
          const pConf = PETS.find(p => p.id === petInstance.petId);
          if (pConf && pConf.modifierType === 'click') {
            clickPower *= (1 + (pConf.baseModifier * petInstance.level));
          }
        }
      });

      set({ clickPower: clickPower * globalMulti });
    }
  },

  syncDB: async () => {
    const state = get();
    if (!state.session?.user || state.isSyncing || state.id === '') return;
    
    set({ isSyncing: true });
    
    const { coins, gems, level, experience, prestiges, rebirths, ascensions, playtime } = state;
    const gameState = state.state;
    
    await supabase.from('profiles').update({
      coins,
      gems,
      level,
      experience,
      prestiges,
      rebirths,
      ascensions,
      playtime,
      state: gameState,
      last_login: new Date().toISOString()
    }).eq('id', state.session.user.id);
    
    set({ isSyncing: false });
  },

  clickCore: () => {
    const state = get();
    const isCritical = Math.random() < 0.05; // 5% chance
    const multiplier = isCritical ? 3.5 : 1;
    const value = state.clickPower * multiplier;
    
    if (!state.state.settings?.muted) {
      playSfx(isCritical ? 'crit' : 'click', state.state.settings?.sfxVolume || 1);
    }
    
    set((prev) => {
      let exp = prev.experience + 1;
      let newLvl = prev.level;
      let reqExp = LEVELS.getRequiredExp(newLvl);
      
      if (exp >= reqExp) {
        newLvl += 1;
        exp -= reqExp;
      }

      // Pet EXP
      const newInventoryPets = [...(prev.state.inventoryPets || [])];
      let didLevelPet = false;
      prev.state.equippedPets?.forEach(petId => {
         const pid = newInventoryPets.findIndex(p => p.id === petId);
         if (pid !== -1) {
            newInventoryPets[pid] = { ...newInventoryPets[pid], exp: newInventoryPets[pid].exp + 10 };
            if (newInventoryPets[pid].exp > newInventoryPets[pid].level * 1000) {
               newInventoryPets[pid].level += 1;
               newInventoryPets[pid].exp = 0;
               didLevelPet = true;
            }
         }
      });
      if (didLevelPet && !prev.state.settings?.muted) {
         playSfx('upgrade', prev.state.settings?.sfxVolume || 1);
      }

      const newState = {
        ...prev.state,
        inventoryPets: newInventoryPets,
        coinsEarnedThisRun: (prev.state.coinsEarnedThisRun || 0) + value,
        stats: {
          ...prev.state.stats,
          total_clicks: (prev.state.stats.total_clicks || 0) + 1,
          critical_clicks: (prev.state.stats.critical_clicks || 0) + (isCritical ? 1 : 0)
        }
      };

      return {
        coins: prev.coins + value,
        experience: exp,
        level: newLvl,
        state: newState,
        combo: Math.min(prev.combo + 1, 100)
      };
    });
    
    return { critical: isCritical, value };
  },

  buyBuilding: (buildingId) => {
    const state = get();
    const config = BUILDINGS.find(b => b.id === buildingId);
    if (!config) return false;
    
    const count = state.state.buildings[buildingId] || 0;
    const cost = Math.floor(config.baseCost * Math.pow(1.15, count));
    
    if (state.coins >= cost) {
      if (!state.state.settings?.muted) playSfx('purchase', state.state.settings?.sfxVolume || 1);
      
      set((prev) => {
        const newBuildings = { ...prev.state.buildings, [buildingId]: count + 1 };
        return {
          coins: prev.coins - cost,
          state: { ...prev.state, buildings: newBuildings }
        };
      });
      return true;
    }
    return false;
  },

  buyUpgrade: (upgradeId) => {
    const state = get();
    const config = UPGRADES.find(u => u.id === upgradeId);
    if (!config || state.state.upgrades.includes(upgradeId) || state.coins < config.cost) return false;
    
    if (!state.state.settings?.muted) playSfx('upgrade', state.state.settings?.sfxVolume || 1);

    set((prev) => ({
      coins: prev.coins - config.cost,
      state: { ...prev.state, upgrades: [...prev.state.upgrades, upgradeId] }
    }));
    return true;
  },

  equipPet: (instanceId) => {
    set(prev => {
      const equip = prev.state.equippedPets || [];
      if (equip.includes(instanceId) || equip.length >= 3) return prev; // max 3 pets
      return { state: { ...prev.state, equippedPets: [...equip, instanceId] } };
    });
  },

  unequipPet: (instanceId) => {
    set(prev => {
      const equip = prev.state.equippedPets || [];
      return { state: { ...prev.state, equippedPets: equip.filter(id => id !== instanceId) } };
    });
  },

  updateSettings: (settings) => {
    set(prev => ({
      state: {
        ...prev.state,
        settings: { ...prev.state.settings, ...settings } as GameState['settings']
      }
    }));
  },

  prestige: () => {
    const state = get();
    if (state.coins < 10000000) return; // Unlocks at 10M
    
    if (!state.state.settings?.muted) playSfx('prestige', state.state.settings?.sfxVolume || 1);

    const prestigeGain = Math.floor(Math.sqrt((state.state.coinsEarnedThisRun || state.coins) / 10000000));
    
    set((prev) => ({
      coins: 0,
      prestiges: prev.prestiges + prestigeGain,
      state: { 
        ...prev.state, 
        buildings: {}, 
        upgrades: [],
        coinsEarnedThisRun: 0
      },
      level: 1, experience: 0
    }));
  },

  gameTick: () => {
    const state = get();
    const now = Date.now();
    const delta = (now - state.lastTick) / 1000;
    
    // Calculate CPS
    let cps = 0;
    let globalMulti = 1;
    const upgrades = state.state.upgrades || [];
    
    UPGRADES.filter(u => upgrades.includes(u.id) && !u.targetBuilding).forEach(u => {
      globalMulti *= u.multiplier;
    });
    globalMulti *= (1 + (state.prestiges || 0) * 0.05);

    state.state.equippedPets?.forEach(petId => {
      const petInstance = state.state.inventoryPets?.find(p => p.id === petId);
      if (petInstance) {
        const pConf = PETS.find(p => p.id === petInstance.petId);
        if (pConf && pConf.modifierType === 'global') {
          globalMulti *= (1 + (pConf.baseModifier * petInstance.level));
        }
      }
    });

    Object.entries(state.state.buildings || {}).forEach(([bId, amount]) => {
      const config = BUILDINGS.find(b => b.id === bId);
      if (config) {
        let bMulti = 1;
        UPGRADES.filter(u => upgrades.includes(u.id) && u.targetBuilding === bId).forEach(u => {
          bMulti *= u.multiplier;
        });

        // Pet Building Multiplier
        state.state.equippedPets?.forEach(petId => {
          const petInstance = state.state.inventoryPets?.find(p => p.id === petId);
          if (petInstance) {
            const pConf = PETS.find(p => p.id === petInstance.petId);
            if (pConf && pConf.modifierType === 'building' && pConf.targetBuilding === bId) {
              bMulti *= (1 + (pConf.baseModifier * petInstance.level));
            }
          }
        });

        cps += config.baseProduction * amount * bMulti;
      }
    });
    
    cps *= globalMulti;
    
    let clickPower = 1;
    UPGRADES.filter(u => upgrades.includes(u.id) && u.id.startsWith('u_click_')).forEach(u => {
      clickPower *= u.multiplier;
    });

    state.state.equippedPets?.forEach(petId => {
      const petInstance = state.state.inventoryPets?.find(p => p.id === petId);
      if (petInstance) {
        const pConf = PETS.find(p => p.id === petInstance.petId);
        if (pConf && pConf.modifierType === 'click') {
          clickPower *= (1 + (pConf.baseModifier * petInstance.level));
        }
      }
    });

    clickPower *= globalMulti;
    
    set((prev) => ({
      coins: prev.coins + (cps * delta),
      state: {
        ...prev.state,
        coinsEarnedThisRun: (prev.state.coinsEarnedThisRun || prev.coins) + (cps * delta)
      },
      cps,
      clickPower,
      lastTick: now,
      playtime: prev.playtime + delta,
    }));
  }
}));
