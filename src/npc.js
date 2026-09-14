import { DISTRICTS } from './district.js';

export const NPC_FIELDS = Object.freeze({
  id: 'Unique generated identity supplied by the situation that creates this NPC.',
  type: 'Stable NPC archetype id used for generation and later behavior.',
  district: 'District id where this NPC was generated.',
  money: 'Cash carried in 1920 U.S. dollars.',
  strength: 'Physical leverage available to this NPC in later contests.'
});

const band = (min, mode, max) => Object.freeze({ min, mode, max });
const archetype = (id, name, money, strength) => Object.freeze({
  id, name, money: band(...money), strength: band(...strength)
});

// Cash bands follow economic_anchors.md: an ordinary pickpocket target normally
// carries no more than $10 in 1920 U.S. dollars. The mode is the common result;
// min/max are possible edges rather than equally likely outcomes.
export const NPC_ARCHETYPES = Object.freeze({
  manual_worker: archetype('manual_worker', 'Manual worker', [0.25, 1.5, 4], [20, 30, 45]),
  skilled_tradesperson: archetype('skilled_tradesperson', 'Skilled tradesperson', [1, 3, 6], [20, 30, 42]),
  service_worker: archetype('service_worker', 'Service worker', [0.25, 1.5, 4], [10, 20, 32]),
  clerk: archetype('clerk', 'Clerk or civil servant', [0.75, 2.5, 6], [10, 20, 30]),
  merchant: archetype('merchant', 'Merchant or shopkeeper', [1.5, 4, 9], [12, 22, 34]),
  student: archetype('student', 'Student or academic', [0.25, 1.5, 4], [10, 18, 30]),
  nightlife_patron: archetype('nightlife_patron', 'Nightlife patron', [0.5, 3.5, 9], [10, 22, 36]),
  drifter: archetype('drifter', 'Drifter', [0, 0.5, 2], [10, 20, 32]),
  affluent_professional: archetype('affluent_professional', 'Affluent professional', [3, 6, 10], [12, 22, 32]),
  society_elite: archetype('society_elite', 'Society elite', [4, 8, 10], [10, 20, 30]),
  underworld_regular: archetype('underworld_regular', 'Underworld regular', [1, 4, 9], [20, 32, 48]),
  rural_worker: archetype('rural_worker', 'Rural worker', [0.25, 1.5, 4], [20, 30, 44])
});

export const NPC_PRESENCE = Object.freeze({
  dominant: 40,
  common: 15,
  uncommon: 4,
  rare: 0.25,
  absent: 0
});

const TYPE_IDS = Object.freeze(Object.keys(NPC_ARCHETYPES));

function districtPresence(groups) {
  const weights = Object.fromEntries(TYPE_IDS.map(id => [id, NPC_PRESENCE.absent]));
  for (const [presence, ids] of Object.entries(groups)) {
    if (!Object.hasOwn(NPC_PRESENCE, presence)) throw new Error(`Unknown NPC presence: ${presence}`);
    for (const id of ids) {
      if (!Object.hasOwn(NPC_ARCHETYPES, id)) throw new Error(`Unknown NPC archetype in presence data: ${id}`);
      if (weights[id] !== NPC_PRESENCE.absent) throw new Error(`Duplicate NPC presence for ${id}`);
      weights[id] = NPC_PRESENCE[presence];
    }
  }
  return Object.freeze(weights);
}

// These are relative selection weights, not literal percentages. Very unlikely
// visitors stay possible without making them routine members of a district crowd.
export const DISTRICT_NPC_WEIGHTS = Object.freeze({
  downtown: districtPresence({
    dominant: ['clerk', 'affluent_professional'], common: ['merchant', 'service_worker'],
    uncommon: ['society_elite', 'student', 'manual_worker'], rare: ['drifter', 'underworld_regular']
  }),
  docks: districtPresence({
    dominant: ['manual_worker'], common: ['skilled_tradesperson', 'drifter'],
    uncommon: ['merchant', 'underworld_regular', 'service_worker'], rare: ['affluent_professional', 'society_elite']
  }),
  little_italy: districtPresence({
    dominant: ['merchant', 'manual_worker'], common: ['skilled_tradesperson', 'service_worker'],
    uncommon: ['clerk', 'underworld_regular'], rare: ['affluent_professional', 'society_elite', 'student']
  }),
  theater_district: districtPresence({
    dominant: ['nightlife_patron'], common: ['affluent_professional', 'service_worker'],
    uncommon: ['merchant', 'society_elite', 'student'], rare: ['manual_worker', 'drifter', 'underworld_regular']
  }),
  industrial_district: districtPresence({
    dominant: ['manual_worker'], common: ['skilled_tradesperson', 'clerk'],
    uncommon: ['service_worker', 'merchant', 'drifter'], rare: ['affluent_professional', 'society_elite']
  }),
  tenderloin: districtPresence({
    dominant: ['nightlife_patron', 'underworld_regular'], common: ['service_worker', 'drifter'],
    uncommon: ['merchant', 'manual_worker', 'affluent_professional'], rare: ['society_elite', 'student']
  }),
  chinatown: districtPresence({
    dominant: ['merchant', 'skilled_tradesperson'], common: ['manual_worker', 'service_worker'],
    uncommon: ['clerk', 'student', 'nightlife_patron'], rare: ['affluent_professional', 'society_elite', 'drifter']
  }),
  irish_quarter: districtPresence({
    dominant: ['manual_worker'], common: ['skilled_tradesperson', 'underworld_regular'],
    uncommon: ['merchant', 'drifter', 'service_worker'], rare: ['affluent_professional', 'society_elite', 'student']
  }),
  government_row: districtPresence({
    dominant: ['clerk'], common: ['affluent_professional', 'service_worker'],
    uncommon: ['merchant', 'student', 'society_elite'], rare: ['drifter', 'underworld_regular', 'manual_worker']
  }),
  tenements: districtPresence({
    dominant: ['manual_worker', 'drifter'], common: ['service_worker', 'skilled_tradesperson'],
    uncommon: ['merchant', 'underworld_regular'], rare: ['affluent_professional', 'society_elite', 'clerk']
  }),
  high_society: districtPresence({
    dominant: ['society_elite', 'affluent_professional'], common: ['service_worker', 'clerk'],
    uncommon: ['merchant', 'skilled_tradesperson'], rare: ['drifter', 'underworld_regular', 'manual_worker']
  }),
  balkan_quarter: districtPresence({
    dominant: ['merchant', 'skilled_tradesperson'], common: ['manual_worker', 'service_worker'],
    uncommon: ['clerk', 'student'], rare: ['affluent_professional', 'society_elite', 'underworld_regular']
  }),
  rail_yards: districtPresence({
    dominant: ['manual_worker'], common: ['skilled_tradesperson', 'drifter'],
    uncommon: ['clerk', 'underworld_regular', 'merchant'], rare: ['affluent_professional', 'society_elite', 'service_worker']
  }),
  university_district: districtPresence({
    dominant: ['student'], common: ['clerk', 'service_worker'],
    uncommon: ['affluent_professional', 'merchant', 'nightlife_patron'], rare: ['society_elite', 'manual_worker', 'drifter']
  }),
  auto_district: districtPresence({
    dominant: ['skilled_tradesperson'], common: ['manual_worker', 'clerk'],
    uncommon: ['merchant', 'service_worker', 'affluent_professional'], rare: ['society_elite', 'drifter', 'underworld_regular']
  }),
  outskirts: districtPresence({
    dominant: ['rural_worker'], common: ['manual_worker', 'drifter'],
    uncommon: ['skilled_tradesperson', 'merchant'], rare: ['affluent_professional', 'society_elite', 'student', 'underworld_regular']
  })
});

function draw(random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1)
    throw new Error('Random draw must be in [0, 1)');
  return value;
}

function resolveDistrict(value) {
  const id = typeof value === 'string' ? value : value?.id;
  const district = DISTRICTS[id];
  if (!district || (typeof value === 'object' && value !== district))
    throw new Error(`Unknown NPC district: ${id}`);
  return district;
}

function selectType(districtId, random) {
  const weights = DISTRICT_NPC_WEIGHTS[districtId];
  const total = TYPE_IDS.reduce((sum, id) => sum + weights[id], 0);
  let remaining = draw(random) * total;
  for (const id of TYPE_IDS) {
    remaining -= weights[id];
    if (remaining < 0) return id;
  }
  throw new Error(`District ${districtId} has no NPC population.`);
}

function triangular(range, random) {
  const value = draw(random);
  const width = range.max - range.min;
  if (width === 0) return range.min;
  const split = (range.mode - range.min) / width;
  return value < split
    ? range.min + Math.sqrt(value * width * (range.mode - range.min))
    : range.max - Math.sqrt((1 - value) * width * (range.max - range.mode));
}

export function createNpc(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('NPC must be an object.');
  for (const key of Object.keys(values))
    if (!Object.hasOwn(NPC_FIELDS, key)) throw new Error(`Unknown NPC attribute: ${key}`);
  if (typeof values.id !== 'string' || !values.id.trim()) throw new Error('NPC needs a nonempty id.');
  if (!Object.hasOwn(NPC_ARCHETYPES, values.type)) throw new Error(`Unknown NPC type: ${values.type}`);
  if (!Object.hasOwn(DISTRICTS, values.district)) throw new Error(`Unknown NPC district: ${values.district}`);
  const cents = values.money * 100;
  if (!Number.isFinite(values.money) || values.money < 0 ||
      Math.abs(Math.round(cents) - cents) > Number.EPSILON * 100)
    throw new Error('NPC money must be a nonnegative amount in whole cents.');
  if (!Number.isInteger(values.strength) || values.strength < 0)
    throw new Error('NPC strength must be a nonnegative integer.');
  return Object.freeze({ ...values });
}

export function generateNpc({ id, district, type } = {}, random = Math.random) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('Generated NPC needs a nonempty id.');
  const location = resolveDistrict(district);
  const typeId = type ?? selectType(location.id, random);
  const definition = NPC_ARCHETYPES[typeId];
  if (!definition) throw new Error(`Unknown NPC type: ${typeId}`);
  const money = Math.round(triangular(definition.money, random) * 100) / 100;
  const strength = Math.round(triangular(definition.strength, random));
  return createNpc({ id, type: typeId, district: location.id, money, strength });
}

export function generateNpcs({ district, count = 3, startingId = 1 } = {}, random = Math.random) {
  if (!Number.isInteger(count) || count < 1) throw new Error('NPC count must be a positive integer.');
  if (!Number.isSafeInteger(startingId) || startingId < 1)
    throw new Error('NPC startingId must be a positive safe integer.');
  const npcs = [];
  for (let index = 0; index < count; index++)
    npcs.push(generateNpc({ id: `npc_${startingId + index}`, district }, random));
  return Object.freeze(npcs);
}
