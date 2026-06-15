import type { ProtoTech, EnemyDrop } from '../types';

export const protoTechList: ProtoTech[] = [
  {
    id: 'tech_reroll_preserve',
    name: '量子骰子稳定器',
    description: '首次重掷时自动保留最高点数的一个未锁定骰子',
    cost: 30,
    coreDataRequired: 1,
    tier: 1,
    branch: 'utility',
    effect: {
      type: 'first_reroll_preserve',
      value: 1,
      description: '首次重掷保留1个最高点数未锁定骰子',
    },
    sideEffect: {
      type: 'reroll_count_penalty',
      value: -1,
      description: '总重掷次数减少1次',
    },
    prerequisites: [],
    mutuallyExclusive: [],
    icon: '🎲',
  },
  {
    id: 'tech_shield_overflow',
    name: '护盾能量转换器',
    description: '护盾超出上限的部分转化为能量',
    cost: 40,
    coreDataRequired: 2,
    tier: 1,
    branch: 'defense',
    effect: {
      type: 'shield_overflow_to_energy',
      value: 0.5,
      description: '溢出护盾50%转化为能量',
    },
    sideEffect: {
      type: 'shield_efficiency_penalty',
      value: -0.15,
      description: '护盾恢复效率降低15%',
    },
    prerequisites: [],
    mutuallyExclusive: ['tech_shield_absorption_boost'],
    icon: '🔋',
  },
  {
    id: 'tech_repair_cooling',
    name: '维修冷却系统',
    description: '维修舱修复船体时同时降低所有舱室冷却',
    cost: 35,
    coreDataRequired: 2,
    tier: 1,
    branch: 'utility',
    effect: {
      type: 'repair_cooling',
      value: 1,
      description: '维修时所有舱室冷却-1',
    },
    sideEffect: {
      type: 'repair_efficiency_penalty',
      value: -0.2,
      description: '修复量降低20%',
    },
    prerequisites: [],
    mutuallyExclusive: ['tech_repair_cooldown_reduce'],
    icon: '❄️',
  },
  {
    id: 'tech_crit_alert',
    name: '警戒标记系统',
    description: '武器暴击后提高敌方警戒，降低其闪避率',
    cost: 45,
    coreDataRequired: 2,
    tier: 2,
    branch: 'offense',
    effect: {
      type: 'crit_increase_alert',
      value: 0.15,
      description: '暴击后敌方闪避率降低15%（持续1回合）',
    },
    sideEffect: {
      type: 'enemy_attack_boost',
      value: 0.1,
      description: '敌方攻击力提高10%（持续1回合）',
    },
    prerequisites: ['tech_damage_crit_bonus'],
    mutuallyExclusive: [],
    icon: '🎯',
  },
  {
    id: 'tech_overheat_boost',
    name: '热量循环系统',
    description: '过热的多余热量转化为护盾，而非完全失效',
    cost: 50,
    coreDataRequired: 3,
    tier: 2,
    branch: 'manipulation',
    effect: {
      type: 'overheat_to_shield',
      value: 2,
      description: '超过过热阈值的点数，每点转化为2点护盾',
    },
    sideEffect: {
      type: 'overheat_threshold_lower',
      value: 1,
      description: '过热阈值-1',
    },
    prerequisites: [],
    mutuallyExclusive: [],
    icon: '🔥',
  },
  {
    id: 'tech_energy_regen',
    name: '骰子共鸣装置',
    description: '点数为6的骰子产生额外能量',
    cost: 55,
    coreDataRequired: 3,
    tier: 2,
    branch: 'utility',
    effect: {
      type: 'dice_energy_resonance',
      value: 1,
      description: '每个6点骰子额外产生1点能量',
    },
    sideEffect: {
      type: 'max_energy_penalty',
      value: -2,
      description: '最大能量降低2',
    },
    prerequisites: ['tech_shield_overflow'],
    mutuallyExclusive: [],
    icon: '⚡',
  },
  {
    id: 'tech_damage_crit_bonus',
    name: '穿甲暴击系统',
    description: '暴击伤害无视敌方护盾直接命中船体',
    cost: 40,
    coreDataRequired: 2,
    tier: 1,
    branch: 'offense',
    effect: {
      type: 'crit_pierce_shield',
      value: 1,
      description: '暴击伤害完全穿透护盾',
    },
    sideEffect: {
      type: 'normal_damage_penalty',
      value: -0.2,
      description: '普通攻击伤害降低20%',
    },
    prerequisites: [],
    mutuallyExclusive: ['tech_evasion_crit_penalty'],
    icon: '💥',
  },
  {
    id: 'tech_shield_absorption_boost',
    name: '反射护盾阵列',
    description: '护盾吸收伤害时反弹部分伤害给敌人',
    cost: 50,
    coreDataRequired: 3,
    tier: 2,
    branch: 'defense',
    effect: {
      type: 'shield_reflect',
      value: 0.2,
      description: '护盾吸收伤害的20%反弹给敌人',
    },
    sideEffect: {
      type: 'max_shield_penalty',
      value: -0.2,
      description: '最大护盾降低20%',
    },
    prerequisites: [],
    mutuallyExclusive: ['tech_shield_overflow'],
    icon: '🛡️',
  },
  {
    id: 'tech_evasion_crit_penalty',
    name: '高机动火控系统',
    description: '敌方闪避时提高你的暴击率',
    cost: 45,
    coreDataRequired: 3,
    tier: 2,
    branch: 'offense',
    effect: {
      type: 'evasion_crit_penalty',
      value: 0.25,
      description: '敌方闪避越高，你的暴击率越高（最多+25%）',
    },
    sideEffect: {
      type: 'self_evasion_penalty',
      value: -0.1,
      description: '自身闪避率降低10%',
    },
    prerequisites: [],
    mutuallyExclusive: ['tech_damage_crit_bonus'],
    icon: '🔭',
  },
  {
    id: 'tech_repair_cooldown_reduce',
    name: '纳米修复群',
    description: '维修舱同时修复船体和一个损坏的舱室',
    cost: 60,
    coreDataRequired: 4,
    tier: 3,
    branch: 'utility',
    effect: {
      type: 'nano_repair_swarm',
      value: 1,
      description: '维修时自动修复一个冷却中的舱室',
    },
    sideEffect: {
      type: 'repair_efficiency_penalty',
      value: -0.25,
      description: '船体修复量降低25%',
    },
    prerequisites: ['tech_repair_cooling'],
    mutuallyExclusive: ['tech_repair_cooling'],
    icon: '🧬',
  },
];

export const enemyDropTable: EnemyDrop[] = [
  {
    enemyType: 'drone',
    coreDataChance: 0.1,
    coreDataMin: 1,
    coreDataMax: 1,
  },
  {
    enemyType: 'fighter',
    coreDataChance: 0.2,
    coreDataMin: 1,
    coreDataMax: 2,
  },
  {
    enemyType: 'raider',
    coreDataChance: 0.3,
    coreDataMin: 1,
    coreDataMax: 2,
  },
  {
    enemyType: 'cruiser',
    coreDataChance: 0.5,
    coreDataMin: 2,
    coreDataMax: 4,
  },
  {
    enemyType: 'boss',
    coreDataChance: 1.0,
    coreDataMin: 3,
    coreDataMax: 6,
  },
];

export function rollCoreDataDrop(enemyType: string): number {
  const drop = enemyDropTable.find(d => d.enemyType === enemyType);
  if (!drop) return 0;
  
  if (Math.random() > drop.coreDataChance) return 0;
  
  return Math.floor(
    Math.random() * (drop.coreDataMax - drop.coreDataMin + 1)
  ) + drop.coreDataMin;
}

export function getTechById(id: string): ProtoTech | undefined {
  return protoTechList.find(t => t.id === id);
}

export function getTechByBranch(branch: ProtoTech['branch']): ProtoTech[] {
  return protoTechList.filter(t => t.branch === branch);
}

export function getTechByTier(tier: ProtoTech['tier']): ProtoTech[] {
  return protoTechList.filter(t => t.tier === tier);
}
