import type { Die, CabinType, DiceFace, ProtoTechState } from '../types';
import { standardDiceFaces } from '../data/diceFaces';
import { hasFirstRerollPreserve } from './protoTech';

export function createDie(id: string): Die {
  return {
    id,
    value: 0,
    locked: false,
    assignedTo: null,
    isRolling: false,
  };
}

export function createInitialDice(count: number): Die[] {
  return Array.from({ length: count }, (_, i) => createDie(`die_${i + 1}`));
}

export function rollDie(diceFaces: DiceFace[] = standardDiceFaces): number {
  const index = Math.floor(Math.random() * diceFaces.length);
  return diceFaces[index].value;
}

export function rollDice(
  dice: Die[],
  diceFaces?: DiceFace[],
  techState: ProtoTechState = { researched: [], enabled: [], coreData: 0 },
  isFirstReroll: boolean = false
): Die[] {
  let preservedDice: Die[] = [];
  let diceToRoll = [...dice];

  if (isFirstReroll && hasFirstRerollPreserve(techState)) {
    const unlockedDice = dice.filter(d => !d.locked && d.value > 0);
    if (unlockedDice.length > 0) {
      const sortedUnlocked = [...unlockedDice].sort((a, b) => b.value - a.value);
      const toPreserve = sortedUnlocked.slice(0, 1).map(d => d.id);
      
      preservedDice = dice.filter(d => toPreserve.includes(d.id) || d.locked);
      diceToRoll = dice.filter(d => !toPreserve.includes(d.id) && !d.locked);
    }
  }

  const rolledDice = diceToRoll.map(die => {
    return {
      ...die,
      value: rollDie(diceFaces),
      isRolling: true,
    };
  });

  return [...preservedDice.map(d => ({ ...d })), ...rolledDice].sort((a, b) => {
    const aNum = parseInt(a.id.replace('die_', ''));
    const bNum = parseInt(b.id.replace('die_', ''));
    return aNum - bNum;
  });
}

export function toggleLock(dice: Die[], dieId: string): Die[] {
  return dice.map(die => {
    if (die.id !== dieId) return die;
    if (die.assignedTo !== null) return die;
    return {
      ...die,
      locked: !die.locked,
    };
  });
}

export function assignDieToCabin(dice: Die[], dieId: string, cabinType: CabinType | null): Die[] {
  return dice.map(die => {
    if (die.id !== dieId) return die;
    return {
      ...die,
      assignedTo: cabinType,
      locked: cabinType !== null,
    };
  });
}

export function unassignAllDice(dice: Die[]): Die[] {
  return dice.map(die => ({
    ...die,
    assignedTo: null,
    locked: false,
  }));
}

export function resetRollingState(dice: Die[]): Die[] {
  return dice.map(die => ({
    ...die,
    isRolling: false,
  }));
}

export function getTotalPointsByCabin(dice: Die[], cabinType: CabinType): number {
  return dice
    .filter(d => d.assignedTo === cabinType)
    .reduce((sum, d) => sum + d.value, 0);
}

export function getDiceByCabin(dice: Die[], cabinType: CabinType): Die[] {
  return dice.filter(d => d.assignedTo === cabinType);
}

export function getUnassignedDice(dice: Die[]): Die[] {
  return dice.filter(d => d.assignedTo === null);
}

export function getTotalPoints(dice: Die[]): number {
  return dice.reduce((sum, d) => sum + d.value, 0);
}

export function areAllDiceAssigned(dice: Die[]): boolean {
  return dice.every(d => d.assignedTo !== null);
}

export function hasAnyDiceAssigned(dice: Die[]): boolean {
  return dice.some(d => d.assignedTo !== null);
}

export function getCriticalCount(dice: Die[]): number {
  return dice.filter(d => d.value === 6).length;
}

export function calculateCritBonus(dice: Die[], baseRate: number, bonusRate: number): number {
  const criticalDice = getCriticalCount(dice);
  return baseRate + criticalDice * bonusRate;
}

export function calculateEnergyCost(dice: Die[], costPerPoint: number): number {
  return getTotalPoints(dice) * costPerPoint;
}
