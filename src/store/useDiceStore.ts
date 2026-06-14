import { create } from 'zustand';
import type { Die, CabinType, ProtoTechState } from '../types';
import { 
  createInitialDice, 
  rollDice, 
  toggleLock, 
  assignDieToCabin, 
  unassignAllDice,
  resetRollingState,
} from '../utils/dice';
import { useConfigStore } from './useConfigStore';
import { applyTechToConfig } from '../utils/protoTech';
import { useProtoTechStore } from './useProtoTechStore';

interface DiceState {
  dice: Die[];
  rerollsRemaining: number;
  isRolling: boolean;
  hasRolledOnce: boolean;
  
  initializeDice: () => void;
  roll: () => void;
  finishRolling: () => void;
  toggleDieLock: (dieId: string) => void;
  assignDie: (dieId: string, cabinType: CabinType | null) => void;
  unassignAll: () => void;
  resetDice: () => void;
  setDice: (dice: Die[]) => void;
}

export const useDiceStore = create<DiceState>((set, get) => ({
  dice: [],
  rerollsRemaining: 0,
  isRolling: false,
  hasRolledOnce: false,
  
  initializeDice: () => {
    const baseConfig = useConfigStore.getState().config;
    const protoTechState = useProtoTechStore.getState().protoTechState;
    const config = applyTechToConfig(baseConfig, protoTechState);
    set({
      dice: createInitialDice(config.diceCount),
      rerollsRemaining: config.maxRerolls,
      hasRolledOnce: false,
    });
  },
  
  roll: () => {
    const { dice, rerollsRemaining, hasRolledOnce } = get();
    const protoTechState = useProtoTechStore.getState().protoTechState;
    
    if (rerollsRemaining <= 0 && dice.some(d => d.value > 0)) return;
    
    const isFirstReroll = hasRolledOnce && dice.some(d => d.value > 0);
    const rolledDice = rollDice(dice, undefined, protoTechState, isFirstReroll);
    set({
      dice: rolledDice,
      rerollsRemaining: dice[0]?.value > 0 ? rerollsRemaining - 1 : rerollsRemaining,
      isRolling: true,
      hasRolledOnce: true,
    });
    
    setTimeout(() => {
      get().finishRolling();
    }, 500);
  },
  
  finishRolling: () => {
    const { dice } = get();
    set({
      dice: resetRollingState(dice),
      isRolling: false,
    });
  },
  
  toggleDieLock: (dieId) => {
    const { dice } = get();
    set({ dice: toggleLock(dice, dieId) });
  },
  
  assignDie: (dieId, cabinType) => {
    const { dice } = get();
    set({ dice: assignDieToCabin(dice, dieId, cabinType) });
  },
  
  unassignAll: () => {
    const { dice } = get();
    set({ dice: unassignAllDice(dice) });
  },
  
  resetDice: () => {
    const baseConfig = useConfigStore.getState().config;
    const protoTechState = useProtoTechStore.getState().protoTechState;
    const config = applyTechToConfig(baseConfig, protoTechState);
    set({
      dice: createInitialDice(config.diceCount),
      rerollsRemaining: config.maxRerolls,
      isRolling: false,
      hasRolledOnce: false,
    });
  },
  
  setDice: (dice) => {
    set({ dice });
  },
}));
