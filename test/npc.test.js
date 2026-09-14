import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createNpc, DISTRICTS, DISTRICT_NPC_WEIGHTS,
  generateNpc, generateNpcs, NPC_ARCHETYPES, NPC_PRESENCE,
  sequenceRandom } from '../src/engine.js';

test('NPC archetypes use bounded 1920 cash and strength bands', () => {
  assert.ok(Object.isFrozen(NPC_ARCHETYPES));
  for (const [id, definition] of Object.entries(NPC_ARCHETYPES)) {
    assert.equal(definition.id, id);
    assert.ok(definition.name);
    assert.ok(Object.isFrozen(definition));
    for (const key of ['money', 'strength']) {
      const range = definition[key];
      assert.ok(Object.isFrozen(range));
      assert.ok(range.min <= range.mode && range.mode <= range.max);
    }
    assert.ok(definition.money.min >= 0);
    assert.ok(definition.money.max <= 10, `${id} stays within the petty-theft cash anchor`);
  }
});

test('every district has a complete immutable weighted NPC population', () => {
  assert.deepEqual(Object.keys(DISTRICT_NPC_WEIGHTS), Object.keys(DISTRICTS));
  for (const weights of Object.values(DISTRICT_NPC_WEIGHTS)) {
    assert.ok(Object.isFrozen(weights));
    assert.deepEqual(Object.keys(weights), Object.keys(NPC_ARCHETYPES));
    assert.ok(Object.values(weights).some(weight => weight === NPC_PRESENCE.dominant));
    assert.ok(Object.values(weights).reduce((sum, weight) => sum + weight, 0) > 0);
  }
  assert.equal(DISTRICT_NPC_WEIGHTS.docks.manual_worker, NPC_PRESENCE.dominant);
  assert.equal(DISTRICT_NPC_WEIGHTS.docks.society_elite, NPC_PRESENCE.rare);
  assert.equal(DISTRICT_NPC_WEIGHTS.high_society.society_elite, NPC_PRESENCE.dominant);
  assert.equal(DISTRICT_NPC_WEIGHTS.outskirts.rural_worker, NPC_PRESENCE.dominant);
});

test('NPC generation is on demand, deterministic, and does not alter initial state', () => {
  const before = createInitialState();
  const npc = generateNpc({ id: 'npc_7', district: 'docks' }, sequenceRandom([0, 0, 0]));
  assert.deepEqual(npc,
    { id: 'npc_7', type: 'manual_worker', district: 'docks', money: 0.25, strength: 20 });
  assert.ok(Object.isFrozen(npc));
  assert.deepEqual(before, createInitialState());
  assert.equal(Object.hasOwn(before, 'npcs'), false);
});

test('the same population draw produces district-appropriate types', () => {
  const docks = generateNpc({ id: 'npc_1', district: 'docks' }, sequenceRandom([0.5, 0.5, 0.5]));
  const hill = generateNpc({ id: 'npc_2', district: 'high_society' }, sequenceRandom([0.5, 0.5, 0.5]));
  assert.equal(docks.type, 'skilled_tradesperson');
  assert.equal(hill.type, 'affluent_professional');
  assert.notEqual(docks.money, hill.money);
});

test('situations may specify an archetype without consuming a population draw', () => {
  const npc = generateNpc(
    { id: 'npc_elite', district: DISTRICTS.docks, type: 'society_elite' },
    sequenceRandom([0, 0.999999])
  );
  assert.deepEqual(npc,
    { id: 'npc_elite', type: 'society_elite', district: 'docks', money: 4, strength: 30 });
});

test('a requested group receives unique sequential ids and independent specifications', () => {
  const npcs = generateNpcs(
    { district: 'docks', count: 3, startingId: 20 },
    sequenceRandom([0, 0, 0, 0, 0.5, 0.5, 0.99, 0.5, 0.5])
  );
  assert.deepEqual(npcs.map(npc => npc.id), ['npc_20', 'npc_21', 'npc_22']);
  assert.deepEqual(npcs.map(npc => npc.type),
    ['manual_worker', 'manual_worker', 'underworld_regular']);
  assert.equal(new Set(npcs).size, 3);
  assert.ok(Object.isFrozen(npcs));
});

test('supplied NPC fixtures and generator inputs reject invalid world data', () => {
  const valid = { id: 'npc_test', type: 'clerk', district: 'downtown', money: 2.5, strength: 20 };
  assert.deepEqual(createNpc(valid), valid);
  assert.equal(createNpc({ ...valid, money: 0.29 }).money, 0.29);
  assert.throws(() => createNpc({ ...valid, money: 2.555 }), /whole cents/);
  assert.throws(() => generateNpc({ id: 'x', district: 'missing' }), /Unknown NPC district/);
  assert.throws(() => generateNpc({ id: 'x', district: 'docks', type: 'missing' }), /Unknown NPC type/);
  assert.throws(() => generateNpcs({ district: 'docks', count: 0 }), /positive integer/);
  assert.throws(() => generateNpc({ id: 'x', district: 'docks' }, () => 1), /\[0, 1\)/);
});
