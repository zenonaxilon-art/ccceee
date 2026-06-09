import { PetConfig } from '../types/game';

export const PETS: PetConfig[] = [
  { id: 'p_bean', name: 'Golden Bean', rarity: 'Common', baseModifier: 0.1, modifierType: 'global', emoji: '🫘' },
  { id: 'p_mole', name: 'Mining Mole', rarity: 'Rare', baseModifier: 0.15, modifierType: 'building', targetBuilding: 'b_worker', emoji: '🦦' },
  { id: 'p_bot', name: 'Factory Bot', rarity: 'Epic', baseModifier: 0.25, modifierType: 'building', targetBuilding: 'b_factory', emoji: '🤖' },
  { id: 'p_phoenix', name: 'Phoenix', rarity: 'Legendary', baseModifier: 0.5, modifierType: 'global', emoji: '🦅' },
  { id: 'p_dragon', name: 'Cosmic Dragon', rarity: 'Cosmic', baseModifier: 1.0, modifierType: 'global', emoji: '🐉' },
  { id: 'p_titan', name: 'Celestial Titan', rarity: 'Celestial', baseModifier: 2.5, modifierType: 'global', emoji: '🗿' },
];

// Experience formula for pets: level * 1000
export const getPetExpRequirement = (level: number) => level * 1000;
