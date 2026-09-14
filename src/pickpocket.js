// Pickpocketing deliberately begins with one contest: can the player lift the
// target's carried cash? Police, pursuit, and witness resolution are separate
// future systems and do not belong in this first probability.

export const PICKPOCKET_RULES = Object.freeze({
  scoutHours: 0.5,
  scoutEnergy: 5,
  attemptHours: 0.25,
  attemptEnergy: 10,
  prospectLifetimeHours: 1,
  scoutedBonus: 10,
  minimumChance: 15,
  maximumChance: 90,
  baseChance: 55,
  finesseBaseline: 20,
  finessePointsPerLevel: 2
});

export const PICKPOCKET_TYPE_MODIFIERS = Object.freeze({
  manual_worker: 5,
  skilled_tradesperson: 0,
  service_worker: 5,
  clerk: 0,
  merchant: -5,
  student: 5,
  nightlife_patron: 10,
  drifter: 15,
  affluent_professional: -10,
  society_elite: -15,
  underworld_regular: -20,
  rural_worker: 5
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function pickpocketChance(player, npc, scouted = false) {
  const typeModifier = PICKPOCKET_TYPE_MODIFIERS[npc.type];
  if (typeModifier === undefined) throw new Error(`Unknown pickpocket target type: ${npc.type}`);
  const finesseModifier = (player.finesse - PICKPOCKET_RULES.finesseBaseline) *
    PICKPOCKET_RULES.finessePointsPerLevel;
  const scoutingModifier = scouted ? PICKPOCKET_RULES.scoutedBonus : 0;
  const chance = clamp(PICKPOCKET_RULES.baseChance + finesseModifier + typeModifier + scoutingModifier,
    PICKPOCKET_RULES.minimumChance, PICKPOCKET_RULES.maximumChance);
  return Object.freeze({ chance, finesseModifier, typeModifier, scoutingModifier });
}

export function apparentCash(money) {
  if (money < 1) return 'meager pockets';
  if (money < 3) return 'a modest roll';
  if (money < 6) return 'a worthwhile roll';
  return 'a heavy roll';
}

export function apparentDifficulty(chance) {
  if (chance < 50) return 'risky';
  if (chance < 70) return 'fair';
  if (chance < 85) return 'good';
  return 'excellent';
}
