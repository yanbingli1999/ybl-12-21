import React, { useState } from 'react';
import { Coins, ArrowUp, Zap, Heart, Shield, Target, Crosshair, Navigation, Wrench, FlaskConical, Database, Lock, Unlock, AlertTriangle, Check, X } from 'lucide-react';
import { useShipStore } from '../store/useShipStore';
import { useProtoTechStore } from '../store/useProtoTechStore';
import { ShipStatus } from '../components/Ship/ShipStatus';
import { protoTechList, getTechById } from '../data/protoTech';
import type { CabinType, ProtoTech } from '../types';

type TabType = 'upgrades' | 'prototech';

const upgradeIcons: Record<string, React.ReactNode> = {
  hp: <Heart className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  attack: <Target className="w-5 h-5" />,
  defense: <Shield className="w-5 h-5" />,
  evasion: <Navigation className="w-5 h-5" />,
  crit: <Crosshair className="w-5 h-5" />,
  energy: <Zap className="w-5 h-5" />,
  cabin: <Wrench className="w-5 h-5" />,
};

const upgradeColors: Record<string, string> = {
  hp: 'text-neon-green border-neon-green',
  shield: 'text-neon-cyan border-neon-cyan',
  attack: 'text-neon-red border-neon-red',
  defense: 'text-neon-blue border-neon-blue',
  evasion: 'text-neon-purple border-neon-purple',
  crit: 'text-neon-yellow border-neon-yellow',
  energy: 'text-neon-yellow border-neon-yellow',
  cabin: 'text-neon-blue border-neon-blue',
};

const cabinNames: Record<CabinType, string> = {
  engine: '引擎舱',
  shield: '护盾舱',
  weapon: '武器舱',
  repair: '维修舱',
  scanner: '扫描舱',
};

const branchNames: Record<ProtoTech['branch'], string> = {
  offense: '攻击分支',
  defense: '防御分支',
  utility: '功能分支',
  manipulation: '操控分支',
};

const branchColors: Record<ProtoTech['branch'], string> = {
  offense: 'text-neon-red border-neon-red',
  defense: 'text-neon-cyan border-neon-cyan',
  utility: 'text-neon-green border-neon-green',
  manipulation: 'text-neon-purple border-neon-purple',
};

export const UpgradePage: React.FC = () => {
  const { ship, upgrades, rewardPoints, buyUpgrade, applyUpgradeEffects } = useShipStore();
  const { protoTechState, researchTech, enableTech, disableTech, canResearch, canEnable, checkPrerequisites } = useProtoTechStore();
  const [activeTab, setActiveTab] = useState<TabType>('upgrades');

  const handleBuyUpgrade = (upgradeId: string) => {
    const success = buyUpgrade(upgradeId);
    if (success) {
      applyUpgradeEffects();
    }
  };

  const handleResearchTech = (techId: string) => {
    researchTech(techId, (points) => {
      return useShipStore.getState().spendRewardPoints(points);
    });
  };

  const handleToggleTech = (techId: string) => {
    if (protoTechState.enabled.includes(techId)) {
      disableTech(techId);
    } else {
      enableTech(techId);
    }
  };

  const getUpgradeCost = (upgrade: typeof upgrades[0]) => {
    return Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel));
  };

  const canAffordUpgrade = (upgrade: typeof upgrades[0]) => {
    return rewardPoints >= getUpgradeCost(upgrade) && upgrade.currentLevel < upgrade.maxLevel;
  };

  const basicUpgrades = upgrades.filter(u => u.type !== 'cabin');
  const cabinUpgrades = upgrades.filter(u => u.type === 'cabin');

  const techByBranch = protoTechList.reduce((acc, tech) => {
    if (!acc[tech.branch]) acc[tech.branch] = [];
    acc[tech.branch].push(tech);
    return acc;
  }, {} as Record<ProtoTech['branch'], ProtoTech[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-neon-blue">
          舰船改装
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-space-800 px-4 py-2 rounded-lg">
            <Database className="w-5 h-5 text-neon-purple" />
            <span className="text-xl font-display font-bold text-neon-purple">
              {protoTechState.coreData}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-space-800 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-neon-yellow" />
            <span className="text-xl font-display font-bold text-neon-yellow">
              {rewardPoints}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`
            px-6 py-2 rounded-lg font-display font-bold transition-all duration-200
            ${activeTab === 'upgrades'
              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue'
              : 'bg-space-800 text-gray-400 border border-space-700 hover:text-white hover:border-space-600'}
          `}
        >
          <span className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4" />
            基础升级
          </span>
        </button>
        <button
          onClick={() => setActiveTab('prototech')}
          className={`
            px-6 py-2 rounded-lg font-display font-bold transition-all duration-200
            ${activeTab === 'prototech'
              ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple'
              : 'bg-space-800 text-gray-400 border border-space-700 hover:text-white hover:border-space-600'}
          `}
        >
          <span className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            原型科技
          </span>
        </button>
      </div>

      {activeTab === 'upgrades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ShipStatus ship={ship} isPlayer={true} />
            
            <div className="mt-4 glass-panel neon-border p-4 rounded-xl">
              <h3 className="text-lg font-display font-bold text-neon-blue mb-3">升级说明</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• 使用战斗获得的点数进行升级</li>
                <li>• 基础属性升级提升舰船性能</li>
                <li>• 舱室升级增强对应舱位效果</li>
                <li>• 升级后效果立即生效</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" />
                基础属性升级
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {basicUpgrades.map(upgrade => {
                  const colorClass = upgradeColors[upgrade.type];
                  const cost = getUpgradeCost(upgrade);
                  const affordable = canAffordUpgrade(upgrade);
                  const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;

                  return (
                    <div
                      key={upgrade.id}
                      className={`
                        glass-panel p-4 rounded-xl border
                        ${colorClass}
                        ${isMaxed ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`${colorClass}`}>
                            {upgradeIcons[upgrade.type]}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white">
                              {upgrade.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {upgrade.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-display text-gray-400">
                            Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="stat-bar">
                          <div
                            className="stat-bar-fill bg-current opacity-60"
                            style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-neon-yellow" />
                          <span className={`font-display ${affordable ? 'text-neon-yellow' : 'text-gray-500'}`}>
                            {isMaxed ? '已满级' : cost}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyUpgrade(upgrade.id)}
                          disabled={!affordable || isMaxed}
                          className={`
                            px-3 py-1 rounded flex items-center gap-1 text-sm
                            ${affordable && !isMaxed
                              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue/30'
                              : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                            transition-all duration-200
                          `}
                        >
                          <ArrowUp className="w-4 h-4" />
                          升级
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-neon-blue" />
                舱室升级
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cabinUpgrades.map(upgrade => {
                  const colorClass = upgradeColors[upgrade.type];
                  const cost = getUpgradeCost(upgrade);
                  const affordable = canAffordUpgrade(upgrade);
                  const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
                  const cabinName = upgrade.cabinType ? cabinNames[upgrade.cabinType] : '';

                  return (
                    <div
                      key={upgrade.id}
                      className={`
                        glass-panel p-4 rounded-xl border
                        ${colorClass}
                        ${isMaxed ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`${colorClass}`}>
                            {upgradeIcons[upgrade.type]}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white">
                              {cabinName}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {upgrade.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-400">
                          等级: <span className="font-display text-white">{upgrade.currentLevel}/{upgrade.maxLevel}</span>
                        </div>
                        <div className="stat-bar mt-1">
                          <div
                            className="stat-bar-fill bg-current opacity-60"
                            style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-neon-yellow" />
                          <span className={`font-display ${affordable ? 'text-neon-yellow' : 'text-gray-500'}`}>
                            {isMaxed ? '已满级' : cost}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyUpgrade(upgrade.id)}
                          disabled={!affordable || isMaxed}
                          className={`
                            px-3 py-1 rounded flex items-center gap-1 text-sm
                            ${affordable && !isMaxed
                              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue/30'
                              : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                            transition-all duration-200
                          `}
                        >
                          <ArrowUp className="w-4 h-4" />
                          升级
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prototech' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-panel neon-border p-4 rounded-xl">
              <h3 className="text-lg font-display font-bold text-neon-purple mb-3 flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                原型科技说明
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• 使用战斗点数和核心数据进行研究</li>
                <li>• 击败敌人有几率掉落核心数据</li>
                <li>• 原型科技改变基础规则，非简单加属性</li>
                <li>• 每项科技都有副作用</li>
                <li>• 部分科技之间存在互斥关系</li>
                <li>• 可以随时启用或禁用已研究的科技</li>
              </ul>
            </div>

            <div className="mt-4 glass-panel neon-border p-4 rounded-xl">
              <h3 className="text-lg font-display font-bold text-neon-yellow mb-3">研究进度</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">已研究科技</span>
                  <span className="font-display text-white">{protoTechState.researched.length}/{protoTechList.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">已启用科技</span>
                  <span className="font-display text-white">{protoTechState.enabled.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">核心数据</span>
                  <span className="font-display text-neon-purple">{protoTechState.coreData}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {(['offense', 'defense', 'utility', 'manipulation'] as ProtoTech['branch'][]).map(branch => {
              const techs = techByBranch[branch] || [];
              if (techs.length === 0) return null;
              const colorClass = branchColors[branch];

              return (
                <div key={branch}>
                  <h3 className={`text-lg font-display font-bold mb-4 flex items-center gap-2 ${colorClass.split(' ')[0]}`}>
                    {branchNames[branch]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {techs.map(tech => {
                      const isResearched = protoTechState.researched.includes(tech.id);
                      const isEnabled = protoTechState.enabled.includes(tech.id);
                      const prereqMet = checkPrerequisites(tech.id, protoTechState.researched);
                      const researchCheck = canResearch(tech.id, rewardPoints);
                      const enableCheck = canEnable(tech.id);
                      const prereqNames = tech.prerequisites.map(id => getTechById(id)?.name).filter(Boolean);

                      return (
                        <div
                          key={tech.id}
                          className={`
                            glass-panel p-4 rounded-xl border transition-all duration-200
                            ${colorClass}
                            ${isResearched ? '' : 'opacity-75'}
                            ${isEnabled ? 'ring-2 ring-neon-green/50' : ''}
                          `}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{tech.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-display font-bold text-white">
                                    {tech.name}
                                  </h4>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-space-700 text-gray-300">
                                    T{tech.tier}
                                  </span>
                                  {isEnabled && (
                                    <span className="flex items-center gap-1 text-xs text-neon-green">
                                      <Check className="w-3 h-3" />
                                      启用
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {tech.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="text-xs">
                              <span className="text-neon-green">✓ 效果：</span>
                              <span className="text-gray-300">{tech.effect.description}</span>
                            </div>
                            <div className="text-xs">
                              <span className="text-neon-red">⚠ 副作用：</span>
                              <span className="text-gray-300">{tech.sideEffect.description}</span>
                            </div>
                            {tech.prerequisites.length > 0 && (
                              <div className="text-xs">
                                <span className={prereqMet ? 'text-neon-blue' : 'text-gray-500'}>
                                  {prereqMet ? '✓' : '🔒'} 前置：
                                </span>
                                <span className="text-gray-300">{prereqNames.join('、')}</span>
                              </div>
                            )}
                            {tech.mutuallyExclusive.length > 0 && (
                              <div className="text-xs">
                                <span className="text-neon-yellow">
                                  <AlertTriangle className="w-3 h-3 inline" /> 互斥：
                                </span>
                                <span className="text-gray-300">
                                  {tech.mutuallyExclusive.map(id => getTechById(id)?.name).filter(Boolean).join('、')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-neon-yellow" />
                                <span className={`text-xs font-display ${isResearched ? 'text-gray-500 line-through' : 'text-neon-yellow'}`}>
                                  {tech.cost}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-neon-purple" />
                                <span className={`text-xs font-display ${isResearched ? 'text-gray-500 line-through' : 'text-neon-purple'}`}>
                                  {tech.coreDataRequired}
                                </span>
                              </div>
                            </div>

                            {!isResearched ? (
                              <button
                                onClick={() => handleResearchTech(tech.id)}
                                disabled={!researchCheck.canResearch}
                                className={`
                                  px-3 py-1 rounded flex items-center gap-1 text-xs
                                  ${researchCheck.canResearch
                                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple hover:bg-neon-purple/30'
                                    : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                                  transition-all duration-200
                                `}
                                title={researchCheck.reason}
                              >
                                <FlaskConical className="w-3 h-3" />
                                研究
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleTech(tech.id)}
                                disabled={isEnabled ? false : !enableCheck.canEnable}
                                className={`
                                  px-3 py-1 rounded flex items-center gap-1 text-xs
                                  ${isEnabled
                                    ? 'bg-neon-red/20 text-neon-red border border-neon-red hover:bg-neon-red/30'
                                    : enableCheck.canEnable
                                      ? 'bg-neon-green/20 text-neon-green border border-neon-green hover:bg-neon-green/30'
                                      : 'bg-space-700 text-gray-500 border border-space-600 cursor-not-allowed'}
                                  transition-all duration-200
                                `}
                                title={!isEnabled && !enableCheck.canEnable ? enableCheck.reason : ''}
                              >
                                {isEnabled ? (
                                  <>
                                    <X className="w-3 h-3" />
                                    禁用
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    启用
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
