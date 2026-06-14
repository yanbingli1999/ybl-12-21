import { create } from 'zustand';
import type { ProtoTechState, ProtoTech } from '../types';
import { protoTechList, getTechById } from '../data/protoTech';
import { loadProtoTech, saveProtoTech, loadCoreData, saveCoreData, loadEnabledTech, saveEnabledTech } from '../utils/storage';

interface ProtoTechStore {
  protoTechState: ProtoTechState;
  
  loadSavedData: () => void;
  researchTech: (techId: string, spendRewardPoints: (points: number) => boolean) => boolean;
  enableTech: (techId: string) => boolean;
  disableTech: (techId: string) => void;
  addCoreData: (amount: number) => void;
  spendCoreData: (amount: number) => boolean;
  canResearch: (techId: string, rewardPoints: number) => { canResearch: boolean; reason?: string };
  canEnable: (techId: string) => { canEnable: boolean; reason?: string };
  checkMutuallyExclusive: (techId: string, enabled: string[]) => string[];
  checkPrerequisites: (techId: string, researched: string[]) => boolean;
  reset: () => void;
}

export const useProtoTechStore = create<ProtoTechStore>((set, get) => ({
  protoTechState: {
    researched: [],
    enabled: [],
    coreData: 0,
  },

  loadSavedData: () => {
    const researched = loadProtoTech();
    const enabled = loadEnabledTech();
    const coreData = loadCoreData();

    const validEnabled = enabled.filter(id => researched.includes(id));

    set({
      protoTechState: {
        researched,
        enabled: validEnabled,
        coreData,
      },
    });
  },

  canResearch: (techId: string, rewardPoints: number) => {
    const { protoTechState } = get();
    const tech = getTechById(techId);

    if (!tech) {
      return { canResearch: false, reason: '科技不存在' };
    }

    if (protoTechState.researched.includes(techId)) {
      return { canResearch: false, reason: '已研究完成' };
    }

    if (!get().checkPrerequisites(techId, protoTechState.researched)) {
      return { canResearch: false, reason: '前置科技未完成' };
    }

    if (rewardPoints < tech.cost) {
      return { canResearch: false, reason: '战斗点数不足' };
    }

    if (protoTechState.coreData < tech.coreDataRequired) {
      return { canResearch: false, reason: '核心数据不足' };
    }

    return { canResearch: true };
  },

  canEnable: (techId: string) => {
    const { protoTechState } = get();
    const tech = getTechById(techId);

    if (!tech) {
      return { canEnable: false, reason: '科技不存在' };
    }

    if (!protoTechState.researched.includes(techId)) {
      return { canEnable: false, reason: '科技未研究' };
    }

    const conflicting = get().checkMutuallyExclusive(techId, protoTechState.enabled);
    if (conflicting.length > 0) {
      const conflictingNames = conflicting
        .map(id => getTechById(id)?.name)
        .filter(Boolean)
        .join('、');
      return { canEnable: false, reason: `与已启用的 ${conflictingNames} 互斥` };
    }

    return { canEnable: true };
  },

  checkPrerequisites: (techId: string, researched: string[]) => {
    const tech = getTechById(techId);
    if (!tech) return false;

    return tech.prerequisites.every(prereqId => researched.includes(prereqId));
  },

  checkMutuallyExclusive: (techId: string, enabled: string[]) => {
    const tech = getTechById(techId);
    if (!tech) return [];

    const directConflicts = tech.mutuallyExclusive.filter(id => enabled.includes(id));

    const reverseConflicts = protoTechList
      .filter(t => t.mutuallyExclusive.includes(techId) && enabled.includes(t.id))
      .map(t => t.id);

    return [...new Set([...directConflicts, ...reverseConflicts])];
  },

  researchTech: (techId: string, spendRewardPoints: (points: number) => boolean) => {
    const { protoTechState, canResearch } = get();
    const tech = getTechById(techId);

    if (!tech) return false;

    const check = canResearch(techId, 999999);
    if (!check.canResearch) return false;

    if (!spendRewardPoints(tech.cost)) return false;

    if (protoTechState.coreData < tech.coreDataRequired) {
      return false;
    }

    const newState = {
      ...protoTechState,
      researched: [...protoTechState.researched, techId],
      coreData: protoTechState.coreData - tech.coreDataRequired,
    };

    set({ protoTechState: newState });
    saveProtoTech(newState.researched);
    saveCoreData(newState.coreData);

    return true;
  },

  enableTech: (techId: string) => {
    const { protoTechState, canEnable } = get();

    const check = canEnable(techId);
    if (!check.canEnable) return false;

    const newState = {
      ...protoTechState,
      enabled: [...protoTechState.enabled, techId],
    };

    set({ protoTechState: newState });
    saveEnabledTech(newState.enabled);

    return true;
  },

  disableTech: (techId: string) => {
    const { protoTechState } = get();

    const newState = {
      ...protoTechState,
      enabled: protoTechState.enabled.filter(id => id !== techId),
    };

    set({ protoTechState: newState });
    saveEnabledTech(newState.enabled);
  },

  addCoreData: (amount: number) => {
    const { protoTechState } = get();
    const newCoreData = protoTechState.coreData + amount;

    set({
      protoTechState: {
        ...protoTechState,
        coreData: newCoreData,
      },
    });
    saveCoreData(newCoreData);
  },

  spendCoreData: (amount: number) => {
    const { protoTechState } = get();
    if (protoTechState.coreData < amount) return false;

    const newCoreData = protoTechState.coreData - amount;
    set({
      protoTechState: {
        ...protoTechState,
        coreData: newCoreData,
      },
    });
    saveCoreData(newCoreData);
    return true;
  },

  reset: () => {
    set({
      protoTechState: {
        researched: [],
        enabled: [],
        coreData: 0,
      },
    });
    saveProtoTech([]);
    saveEnabledTech([]);
    saveCoreData(0);
  },
}));
