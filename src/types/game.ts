export type PetRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Divine' | 'Cosmic' | 'Celestial';

export interface PetConfig {
  id: string;
  name: string;
  rarity: PetRarity;
  baseModifier: number;
  modifierType: 'global' | 'click' | 'building';
  targetBuilding?: string;
  imageUrl?: string;
  emoji: string;
}

export interface PetInstance {
  id: string; // unique shortid
  petId: string;
  level: number;
  exp: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface BuildingConfig {
  id: string;
  name: string;
  baseCost: number;
  baseProduction: number; // CPS
  description: string;
  icon: string;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  targetBuilding?: string; // If omitted, applies to global multiplier
  description: string;
  icon: string;
  reqLevel?: number;
}

export interface PlayerStats {
  total_clicks: number;
  highest_combo: number;
  critical_clicks: number;
}

export interface GameState {
  buildings: Record<string, number>;
  upgrades: string[];
  pets: string[]; // Legacy
  inventoryPets?: PetInstance[];
  equippedPets?: string[];
  achievements: string[];
  stats: PlayerStats;
  settings?: GameSettings;
  currentWorld?: string;
  coinsEarnedThisRun?: number;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar: string;
  coins: number;
  gems: number;
  prestiges: number;
  rebirths: number;
  ascensions: number;
  playtime: number;
  level: number;
  experience: number;
  state: GameState;
  created_at?: string;
}

export interface Message {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  message: string;
  created_at: string;
}
