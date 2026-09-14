import test from 'node:test';
import assert from 'node:assert/strict';
import { DISTRICTS, RULES, applyAction, createInitialState,
  districtDistance, quoteTravel } from '../src/engine.js';

test('a new player starts in the Docks and local actions add no movement time', () => {
  const before = createInitialState();
  assert.equal(before.player.district, 'docks');
  const result = applyAction(before, { type: 'work', district: 'docks', job: 'stevedore' },
    { random: () => 0 });
  assert.equal(result.state.elapsedHours, 12);
  assert.equal(result.state.player.district, 'docks');
});

test('district positions produce symmetric, relative route distances', () => {
  assert.equal(districtDistance('docks', 'downtown'), 2);
  assert.equal(districtDistance('downtown', 'chinatown'), 1);
  assert.equal(districtDistance('docks', 'chinatown'), 3);
  assert.equal(districtDistance('chinatown', 'docks'), 3);
  assert.equal(districtDistance(DISTRICTS.outskirts, DISTRICTS.little_italy), 6);
});

test('walking, public transportation, and taxis scale time and 1920 fares by distance', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(RULES.travel)
    .map(([id, mode]) => [id, { hoursPerTile: mode.hoursPerTile, costPerTile: mode.costPerTile }])), {
    walk: { hoursPerTile: 0.5, costPerTile: 0 },
    public_transit: { hoursPerTile: 0.25, costPerTile: 0.05 },
    taxi: { hoursPerTile: 0.25, costPerTile: 0.2 }
  });

  for (const [mode, hours, cost] of [
    ['walk', 1, 0], ['public_transit', 0.5, 0.1], ['taxi', 0.5, 0.4]
  ]) {
    const before = createInitialState();
    const result = applyAction(before, { type: 'travel', to: 'downtown', mode });
    assert.equal(result.state.player.district, 'downtown');
    assert.equal(result.state.elapsedHours, hours);
    assert.equal(result.state.player.money, 40 - cost);
    assert.deepEqual(result.events.map(event => event.type), ['travel']);
    assert.deepEqual(result.entries[0].facts, {
      from: 'docks', to: 'downtown', mode, distance: 2, hours, cost, money: 40 - cost,
      reason: `${RULES.travel[mode].name} time and fare scale with the 2-tile route; movement within a district is free`
    });
  }
});

test('longest city route remains bounded while taking more time and money', () => {
  assert.deepEqual(quoteTravel('outskirts', 'little_italy', 'walk'),
    { distance: 6, hours: 3, cost: 0 });
  assert.deepEqual(quoteTravel('outskirts', 'little_italy', 'public_transit'),
    { distance: 6, hours: 1.5, cost: 0.3 });
  assert.deepEqual(quoteTravel('outskirts', 'little_italy', 'taxi'),
    { distance: 6, hours: 1.5, cost: 1.2 });

  const near = quoteTravel('docks', 'tenements', 'taxi');
  const far = quoteTravel('docks', 'outskirts', 'taxi');
  assert.ok(far.hours > near.hours);
  assert.ok(far.cost > near.cost);
});

test('district actions require travel and rejected travel leaves the save unchanged', () => {
  const before = createInitialState();
  const snapshot = structuredClone(before);
  assert.throws(() => applyAction(before,
    { type: 'work', district: 'downtown', job: 'bank_messenger' }),
  /Travel to Downtown/);
  assert.throws(() => applyAction(before,
    { type: 'rest', home: 'mulberry_court_room' }), /Travel to The Slums/);
  assert.throws(() => applyAction(before,
    { type: 'travel', to: 'docks', mode: 'walk' }), /already in Docks/);
  assert.throws(() => applyAction(before,
    { type: 'travel', to: 'downtown', mode: 'car' }), /Unknown travel mode/);
  assert.deepEqual(before, snapshot);
});

test('paid travel is rejected before time or location changes when cash is short', () => {
  const before = createInitialState();
  before.player.money = 0.09;
  const snapshot = structuredClone(before);
  assert.throws(() => applyAction(before,
    { type: 'travel', to: 'downtown', mode: 'public_transit' }), /Need \$0\.10/);
  assert.deepEqual(before, snapshot);
});
