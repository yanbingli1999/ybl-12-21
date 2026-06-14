import type { Ship, GameConfig, Enemy, ProtoTechEffectType, ProtoTechState } from '../types';
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
    const tech = getTechById('tech_reroll_preserve');
    config.maxRerolls = Math.max(0, config.maxRerolls + (tech?.sideEffect.value || 0));
  }

  if (isTechEnabled(techState, 'tech_overheat_boost')) {
    const tech = getTechById('tech_overheat_boost');
    config.overheatThreshold += tech?.effect.value || 0;
  }

  if (isTechEnabled(techState, 'tech_shield_absorption_boost')) {
    const tech = getTechById('tech_shield_absorption_boost');
    config.shieldAbsorptionRate = Math.min(0.95, config.shieldAbsorptionRate + (tech?.effect.value || 0));
  }

  if (isTechEnabled(techState, 'tech_repair_cooldown_reduce')) {
    const tech = getTechById('tech_repair_cooldown_reduce');
    config.repairCooldown = Math.max(1, config.repairCooldown - (tech?.effect.value || 0));
  }

  if (isTechEnabled(techState, 'tech_damage_crit_bonus')) {
    const tech = getTechById('tech_damage_crit_bonus');
    config.critMultiplier += tech?.effect.value || 0;
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

  return {
    ...enemy,
    evasion: Math.max(0, enemy.evasion - tech.effect.value),
    attack: Math.floor(enemy.attack * (1 + tech.sideEffect.value)),
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
  if (isTechEnabled(techState, 'tech_repair_cooling')) {
    const tech = getTechById('tech_repair_cooling');
    return 1 + (tech?.sideEffect.value || 0);
  }
  return 1;
}

export function hasRepairCooling(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_repair_cooling');
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

export function getEnergyCostMultiplier(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_overheat_boost')) {
    const tech = getTechById('tech_overheat_boost');
    return 1 + (tech?.sideEffect.value || 0);
  }
  return 1;
}

export function getExtraEnergyRegen(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_energy_regen')) {
    const tech = getTechById('tech_energy_regen');
    return tech?.effect.value || 0;
  }
  return 0;
}

export function getCabinDamageChanceBonus(techState: ProtoTechState): number {
  if (isTechEnabled(techState, 'tech_repair_cooldown_reduce')) {
    const tech = getTechById('tech_repair_cooldown_reduce');
    return tech?.sideEffect.value || 0;
  }
  return 0;
}

export function hasFirstRerollPreserve(techState: ProtoTechState): boolean {
  return isTechEnabled(techState, 'tech_reroll_preserve');
}
