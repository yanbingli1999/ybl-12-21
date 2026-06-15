import type { Ship, GameConfig, Enemy, ProtoTechEffectType, ProtoTechState, EnemyStatusEffect, Die } from '../types';
import { getTechById } from '../data/protoTech';

export function isTechEnabled(techState: ProtoTechState, techId: string): boolean {
  return techState.enabled.includes(techId) && techState.researched.includes(techId);
}

export function getEnabledTechEffects(techState: ProtoTechState): ProtoTechEffectType[] {
  return techState.enabled
    .filter(id => techState.researched.includes(id))
    .map(id => getTechById(id)?.effect.type)
    .filter((t): t is ProtoTechEffectType => t !== undefined);
}

export function applyTechToConfig(
  baseConfig: GameConfig,
  techState: ProtoTechState
): GameConfig {
  let config = { ...baseConfig };

  if (isTechEnabled(techState, 'tech_reroll_preserve')) {
    config.maxRerolls = Math.max(0, config.maxRerolls - 1);
  }

  if (isTechEnabled(techState, 'tech_overheat_boost')) {
    const tech = getTechById('tech_overheat_boost');
    config.overheatThreshold -= tech?.sideEffect.value || 0;
  }

  return config;
}

export function applyTechToShip(
  baseShip: Ship,
  techState: ProtoTechState
): Ship {
  let ship = { ...baseShip };

  if (isTechEnabled(techState, 'tech_shield_absorption_boost')) {
    const tech = getTechById('tech_shield_absorption_boost');
    const penalty = tech?.sideEffect.value || 0;
    ship.maxShield = Math.max(10, Math.floor(ship.maxShield * (1 + penalty)));
    ship.shield = Math.min(ship.shield, ship.maxShield);
  }

  if (isTechEnabled(techState, 'tech_energy_regen')) {
    const tech = getTechById('tech_energy_regen');
    ship.maxEnergy = Math.max(2, ship.maxEnergy + (tech?.sideEffect.value || 0));
    ship.energy = Math.min(ship.energy, ship.maxEnergy);
  }

  if (isTechEnabled(techState, 'tech_evasion_crit_penalty')) {
    const tech = getTechById('tech_evasion_crit_penalty');
    ship.evasion = Math.max(0, ship.evasion + (tech?.sideEffect.value || 0));
  }

  return ship;
}

export function applyCritAlertEffect(enemy: Enemy, techState: ProtoTechState): Enemy {
  if (!isTechEnabled(techState, 'tech_crit_alert')) {
    return enemy;
  }

  const tech = getTechById('tech_crit_alert');
  if (!tech) return enemy;

  const existingEffect = enemy.statusEffects.find(e => e.type === 'alert_marked');
  let newEffects: EnemyStatusEffect[];
  
  if (existingEffect) {
    newEffects = enemy.statusEffects.map(e =>
      e.type === 'alert_marked' ? { ...e, duration: 1 } : e
    );
  } else {
    newEffects = [...enemy.statusEffects, { type: 'alert_marked', duration: 1, value: tech.effect.value }];
  }

  const newEnemy = {
    ...enemy,
    statusEffects: newEffects,
  };

  return recalculateEnemyFromEffects(newEnemy);
}

export function recalculateEnemyFromEffects(enemy: Enemy): Enemy {
  let attack = enemy.baseAttack;
  let evasion = enemy.baseEvasion;
  let defense = enemy.baseDefense;

  for (const effect of enemy.statusEffects) {
    if (effect.type === 'alert_marked') {
      evasion = Math.max(0, evasion - effect.value);
      attack = Math.floor(attack * 1.1);
    }
  }

  return {
    ...enemy,
    attack,
    evasion,
    defense,
  };
}

export function tickEnemyStatusEffects(enemy: Enemy): { enemy: Enemy; expiredEffects: string[] } {
  const expiredEffects: string[] = [];
  const remainingEffects: EnemyStatusEffect[] = [];

  for (const effect of enemy.statusEffects) {
    const newDuration = effect.duration - 1;
    if (newDuration <= 0) {
      expiredEffects.push(effect.type);
    } else {
      remainingEffects.push({ ...effect, duration: newDuration });
    }
  }

  const newEnemy = {
    ...enemy,
    statusEffects: remainingEffects,
  };

  return {
    enemy: recalculateEnemyFromEffects(newEnemy),
    expiredEffects,
  };
}

export function getShieldOverflowConversionRate(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_shield_overflow')) {
    const tech = getTechById('tech_shield_overflow');
    return tech?.effect.value || 0;
  }
  return 0;
}

export function getShieldEfficiencyMultiplier(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_shield_overflow')) {
    const tech = getTechById('tech_shield_overflow');
    return 1 + (tech?.sideEffect.value || 0);
  }
  return 1;
}

export function getRepairEfficiencyMultiplier(techState: ProtoTechState): number {
  let multiplier = 1;

  if (isTechEnabled(techState, 'tech_repair_cooling')) {
    const tech = getTechById('tech_repair_cooling');
    multiplier *= 1 + (tech?.sideEffect.value || 0);
  }

  if (isTechEnabled(techState, 'tech_repair_cooldown_reduce')) {
    const tech = getTechById('tech_repair_cooldown_reduce');
    multiplier *= 1 + (tech?.sideEffect.value || 0);
  }

  return multiplier;
}

export function hasRepairCooling(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_repair_cooling');
}

export function hasNanoRepairSwarm(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_repair_cooldown_reduce');
}

export function getNormalDamageMultiplier(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_damage_crit_bonus')) {
    const tech = getTechById('tech_damage_crit_bonus');
    return 1 + (tech?.sideEffect.value || 0);
  }
  return 1;
}

export function getEvasionCritBonus(techState: ProtoTechState, enemyEvasion: number): number {
  if (isTechEnabled(techState, 'tech_evasion_crit_penalty')) {
    const tech = getTechById('tech_evasion_crit_penalty');
    return Math.min(tech?.effect.value || 0, enemyEvasion);
  }
  return 0;
}

export function hasCritPierceShield(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_damage_crit_bonus');
}

export function hasOverheatToShield(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_overheat_boost');
}

export function getOverheatToShieldRate(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_overheat_boost')) {
    const tech = getTechById('tech_overheat_boost');
    return tech?.effect.value || 0;
  }
  return 0;
}

export function getShieldReflectRate(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_shield_absorption_boost')) {
    const tech = getTechById('tech_shield_absorption_boost');
    return tech?.effect.value || 0;
  }
  return 0;
}

export function calculateDiceEnergyResonance(dice: Die[], techState: ProtoTechState): number {
  if (!isTechEnabled(techState, 'tech_energy_regen')) {
    return 0;
  }

  const tech = getTechById('tech_energy_regen');
  if (!tech) return 0;

  const sixCount = dice.filter(d => d.value === 6).length;
  return sixCount * tech.effect.value;
}

export function hasFirstRerollPreserve(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_reroll_preserve');
}
