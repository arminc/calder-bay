import test from 'node:test';
import assert from 'node:assert/strict';
import { PICKPOCKET_RULES, applyAction, createInitialState, pickpocketChance,
  sequenceRandom } from '../src/engine.js';

function act(state, action, draws) {
  return applyAction(state, action, { random: sequenceRandom(draws) });
}

const firstThreeDocksNpcs = [
  0, 0, 0,       // manual worker: $0.25, strength 20
  0.5, 0.5, 0.5, // skilled tradesperson
  0.99, 0.5, 0.5 // underworld regular
];

test('pickpocket rules expose the agreed first-step costs and bounded chance', () => {
  assert.deepEqual(PICKPOCKET_RULES, {
    scoutHours: 0.5, scoutEnergy: 5, attemptHours: 0.25, attemptEnergy: 10,
    prospectLifetimeHours: 1, scoutedBonus: 10, minimumChance: 15, maximumChance: 90,
    baseChance: 55, finesseBaseline: 20, finessePointsPerLevel: 2
  });
  const player = { finesse: 20 };
  assert.equal(pickpocketChance(player, { type: 'manual_worker' }).chance, 60);
  assert.equal(pickpocketChance(player, { type: 'manual_worker' }, true).chance, 70);
  assert.equal(pickpocketChance({ finesse: 0 }, { type: 'underworld_regular' }).chance, 15);
  assert.equal(pickpocketChance({ finesse: 100 }, { type: 'drifter' }, true).chance, 90);
});

test('blind pickpocketing generates one local NPC and transfers exact 1920 cash on success', () => {
  const before = createInitialState();
  const snapshot = structuredClone(before);
  // A triangular draw reaches its mode at (mode - min) / (max - min).
  const manualWorkerMoneyModeDraw = (1.5 - 0.25) / (4 - 0.25);
  const result = act(before, { type: 'pickpocket' }, [0, manualWorkerMoneyModeDraw, 0.5, 0.59]);

  assert.deepEqual(before, snapshot);
  assert.deepEqual(result.events.map(event => event.type), ['pickpocket', 'pickpocket_succeeded']);
  assert.equal(result.events[1].causeId, result.events[0].id);
  assert.equal(result.entries[0].facts.target.type, 'manual_worker');
  assert.equal(result.entries[0].facts.target.money, 1.5);
  assert.equal(result.entries[0].facts.chance, 60);
  assert.equal(result.entries[0].facts.draw, 0.59);
  assert.equal(result.state.player.money, 41.5);
  assert.equal(result.state.player.energy, 90);
  assert.equal(result.state.elapsedHours, 0.25);
  assert.equal(result.state.nextNpcId, 2);
  assert.equal(result.state.crime.pickpocketAttempts, 1);
  assert.equal(result.state.crime.pickpocketSuccesses, 1);
  assert.equal(result.state.crime.prospects, null);
});

test('a failed blind lift spends its fixed cost but takes no cash', () => {
  const before = createInitialState();
  const result = act(before, { type: 'pickpocket' }, [0, 0.5, 0.5, 0.6]);

  assert.deepEqual(result.events.map(event => event.type), ['pickpocket', 'pickpocket_failed']);
  assert.equal(result.entries[0].facts.chance, 60);
  assert.equal(result.entries[0].facts.draw, 0.6, 'the boundary is exclusive');
  assert.equal(result.state.player.money, 40);
  assert.equal(result.state.player.energy, 90);
  assert.equal(result.state.elapsedHours, 0.25);
  assert.equal(result.state.crime.pickpocketAttempts, 1);
  assert.equal(result.state.crime.pickpocketSuccesses, 0);
});

test('scouting stores three observations without exposing exact money or strength', () => {
  const result = act(createInitialState(), { type: 'scout_marks' }, firstThreeDocksNpcs);
  const prospects = result.state.crime.prospects;

  assert.deepEqual(result.events.map(event => event.type), ['scout_marks']);
  assert.deepEqual(prospects.npcs.map(npc => npc.id), ['npc_1', 'npc_2', 'npc_3']);
  assert.equal(prospects.district, 'docks');
  assert.equal(prospects.scoutedAtHour, 0.5);
  assert.equal(prospects.expiresAtHour, 1.5);
  assert.equal(result.state.nextNpcId, 4);
  assert.equal(result.state.player.energy, 95);
  assert.equal(result.entries[0].facts.observations.length, 3);
  for (const observation of result.entries[0].facts.observations) {
    assert.deepEqual(Object.keys(observation).sort(),
      ['apparentCash', 'difficulty', 'id', 'type', 'typeName'].sort());
  }
  assert.doesNotMatch(result.entries[0].text, /strength/i);
  assert.doesNotMatch(result.entries[0].text, /\$\d/);
});

test('choosing a scouted mark uses no generation draws and receives the scouting bonus', () => {
  const scouted = act(createInitialState(), { type: 'scout_marks' }, firstThreeDocksNpcs).state;
  const target = scouted.crime.prospects.npcs[0];
  const result = act(scouted, { type: 'pickpocket', target: target.id }, [0.69]);

  assert.deepEqual(result.events.map(event => event.type), ['pickpocket', 'pickpocket_succeeded']);
  assert.equal(result.entries[0].facts.scouted, true);
  assert.equal(result.entries[0].facts.chance, 70);
  assert.equal(result.entries[0].facts.scoutingModifier, 10);
  assert.deepEqual(result.entries[0].facts.discardedProspectIds, ['npc_2', 'npc_3']);
  assert.equal(result.state.nextNpcId, 4);
  assert.equal(result.state.crime.prospects, null);
  assert.equal(result.state.player.money, 40.25);
  assert.equal(result.state.player.energy, 85);
  assert.equal(result.state.elapsedHours, 0.75);
});

test('scouting again replaces prospects with new identities while archetypes may repeat', () => {
  const first = act(createInitialState(), { type: 'scout_marks' }, Array(9).fill(0)).state;
  const second = act(first, { type: 'scout_marks' }, Array(9).fill(0));

  assert.deepEqual(second.state.crime.prospects.npcs.map(npc => npc.id), ['npc_4', 'npc_5', 'npc_6']);
  assert.deepEqual(second.state.crime.prospects.npcs.map(npc => npc.type),
    ['manual_worker', 'manual_worker', 'manual_worker']);
  assert.deepEqual(second.entries[0].facts.replacedIds, ['npc_1', 'npc_2', 'npc_3']);
  assert.equal(second.state.nextNpcId, 7);
  assert.equal(second.state.elapsedHours, 1);
  assert.equal(second.state.player.energy, 90);
});

test('marks may be discarded freely and travel invalidates them', () => {
  const scouted = act(createInitialState(), { type: 'scout_marks' }, firstThreeDocksNpcs).state;
  const walked = act(scouted, { type: 'discard_marks' }, []);
  assert.equal(walked.state.crime.prospects, null);
  assert.equal(walked.state.elapsedHours, 0.5);
  assert.equal(walked.state.player.energy, 95);

  const scoutedAgain = act(walked.state, { type: 'scout_marks' }, firstThreeDocksNpcs).state;
  const traveled = act(scoutedAgain, { type: 'travel', to: 'downtown', mode: 'taxi' }, []);
  assert.equal(traveled.state.crime.prospects, null);
  assert.deepEqual(traveled.entries[0].facts.discardedProspectIds, ['npc_4', 'npc_5', 'npc_6']);
  assert.match(traveled.entries[0].text, /left behind/);
});

test('marks expire after one hour and cannot be attempted at the expiry boundary', () => {
  const scouted = act(createInitialState(), { type: 'scout_marks' }, firstThreeDocksNpcs).state;
  const expired = structuredClone(scouted);
  expired.elapsedHours = expired.crime.prospects.expiresAtHour;
  const snapshot = structuredClone(expired);
  assert.throws(() => act(expired,
    { type: 'pickpocket', target: 'npc_1' }, []), /no longer available/);
  assert.deepEqual(expired, snapshot);

  const throughTime = act(scouted, { type: 'rest', place: 'outside' }, [0.9]);
  assert.equal(throughTime.state.crime.prospects, null);
  assert.equal(throughTime.entries[0].type, 'marks_expired');
  assert.equal(throughTime.entries[1].type, 'rest');
});

test('invalid and under-energy actions consume no draws and leave state unchanged', () => {
  const before = createInitialState();
  before.player.energy = 4;
  const snapshot = structuredClone(before);
  assert.throws(() => act(before, { type: 'scout_marks' }, []), /Need 5 energy/);
  assert.throws(() => act(before, { type: 'pickpocket' }, []), /Need 10 energy/);
  assert.throws(() => act(before, { type: 'discard_marks' }, []), /no scouted marks/);
  assert.deepEqual(before, snapshot);
});
