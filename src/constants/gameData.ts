import { BuildingConfig, UpgradeConfig } from '../types/game';

export const BUILDINGS: BuildingConfig[] = [
  { id: 'b_worker', name: 'Cyber Worker', baseCost: 15, baseProduction: 1, description: 'A basic automated worker scraping data nodes.', icon: 'robot' },
  { id: 'b_factory', name: 'Alloy Factory', baseCost: 100, baseProduction: 5, description: 'Refines base materials into structural units.', icon: 'factory' },
  { id: 'b_machine', name: 'Quantum Machine', baseCost: 1100, baseProduction: 45, description: 'Performs calculations across dimensions.', icon: 'cpu' },
  { id: 'b_ai', name: 'Neural AI System', baseCost: 12000, baseProduction: 260, description: 'Self-improving generation algorithm.', icon: 'brain' },
  { id: 'b_lab', name: 'Dark Matter Lab', baseCost: 130000, baseProduction: 1400, description: 'Extracts energy from the void.', icon: 'flask-conical' },
  { id: 'b_data', name: 'Planetary Data Center', baseCost: 1400000, baseProduction: 7800, description: 'Harvests metrics from entire civilizations.', icon: 'database' },
  { id: 'b_station', name: 'Orbital Space Station', baseCost: 20000000, baseProduction: 44000, description: 'Solar array harvesting pristine cosmic energy.', icon: 'satellite' },
  { id: 'b_colony', name: 'Exoplanet Colony', baseCost: 330000000, baseProduction: 260000, description: 'A fully automated harvesting world.', icon: 'globe' },
  { id: 'b_network', name: 'Galactic Network', baseCost: 5100000000, baseProduction: 1600000, description: 'Interconnected star systems funneling energy.', icon: 'network' },
  { id: 'b_forge', name: 'Reality Forge', baseCost: 75000000000, baseProduction: 10000000, description: 'Rewrites physics to generate infinite wealth.', icon: 'anvil' },
];

export const UPGRADES: UpgradeConfig[] = [
  { id: 'u_click_1', name: 'Reinforced Mouse', cost: 100, multiplier: 2, description: 'Your active clicks are 2x as powerful.', icon: 'mouse-pointer-2' },
  { id: 'u_worker_1', name: 'Overclocked Workers', cost: 500, multiplier: 2, targetBuilding: 'b_worker', description: 'Workers are twice as efficient.', icon: 'zap' },
  { id: 'u_factory_1', name: 'Advanced Alloys', cost: 2500, multiplier: 2, targetBuilding: 'b_factory', description: 'Factories are twice as efficient.', icon: 'zap' },
  { id: 'u_click_2', name: 'Quantum Cursor', cost: 10000, multiplier: 2, description: 'Your active clicks are 2x as powerful.', icon: 'mouse-pointer-2' },
  { id: 'u_global_1', name: 'Synergy Matrix', cost: 50000, multiplier: 1.1, description: 'Boosts ALL production by 10%.', icon: 'globe' },
];

export const LEVELS = {
  getRequiredExp: (level: number) => Math.floor(100 * Math.pow(1.5, level - 1)),
};
