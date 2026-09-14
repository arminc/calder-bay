import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_BUSINESSES, applyAction, createInitialState, sequenceRandom, LegitWork, DISTRICTS
} from '../src/engine.js';

const TEST_BUSINESS = ALL_BUSINESSES.atlas_freight_company;

const shift = (state, job, draws = [], jobs) => applyAction(state,
  { type: 'work', district: jobs?.[job].district.id ?? 'docks', job },
  { random: sequenceRandom(draws), ...(jobs ? { jobs } : {}) });
const sleepOutside = state => applyAction(state, { type: 'rest', place: 'outside' },
  { random: sequenceRandom([0.99]) }).state;

test('a legitimate shift pays its wage in 1920 dollars and consumes exactly its energy and hours', () => {
  const before = createInitialState();
  const { state, entries } = shift(before, 'stevedore', [0.5, 0]);
  assert.equal(state.player.money, 44);
  assert.equal(state.player.energy, 20);
  assert.equal(state.elapsedHours, 12);
  assert.equal(state.workProgress.stevedore.shifts, 1);
  assert.deepEqual(before, createInitialState(), 'a shift does not mutate the prior save');
  assert.match(entries[0].text, /12 hours.*earn \$4\.00.*Heavy labor drains you/);
  assert.deepEqual({ pay: entries[0].facts.pay, energy: entries[0].facts.energy,
    hours: entries[0].facts.hours }, { pay: 4, energy: -80, hours: 12 });
});

test('a successful strength roll adds one after the shift and resets that job’s chance and streak', () => {
  const { state, events, entries } = shift(createInitialState(), 'stevedore', [0.15]);
  assert.equal(state.player.strength, 21);
  assert.deepEqual(state.workProgress.stevedore, { shifts: 1, streak: 0, strengthGains: 1, strengthChance: 0.16 });
  assert.deepEqual(events.map(e => e.type), ['work', 'body_adapts']);
  assert.equal(events[1].causeId, events[0].id);
  assert.deepEqual({ chance: entries[0].facts.strengthChance, draw: entries[0].facts.draw,
    gain: entries[1].facts.gain, nextChance: entries[1].facts.nextChance },
  { chance: 0.16, draw: 0.15, gain: 1, nextChance: 0.16 });
  assert.match(entries[1].text, /strength rises by 1.*chance resets/);
});

test('a missed roll adds a fixed 4–10 percentage points to the next strength chance', () => {
  for (let points = 4; points <= 10; points++) {
    const draw = (points - 3.5) / 7;
    const { state, entries } = shift(createInitialState(), 'stevedore', [0.16, draw]);
    assert.equal(state.player.strength, 20, `+${points}: no strength gain at the boundary`);
    assert.deepEqual(state.workProgress.stevedore,
      { shifts: 1, streak: 1, strengthGains: 0, strengthChance: (16 + points) / 100 });
    assert.equal(entries[0].facts.increasePoints, points);
    assert.equal(entries[0].facts.nextChance, (16 + points) / 100);
  }
});

test('misses accumulate, a later success resets the chance, and other jobs retain their progress', () => {
  let state = shift(createInitialState(), 'stevedore', [0.99, 0]).state; // 16% → 20%
  state = sleepOutside(state);
  state = sleepOutside(state);
  state = shift(state, 'ironworker', [0.99, 0.999]).state; // 12% → 22%
  state = sleepOutside(state);
  state = sleepOutside(state);
  state = shift(state, 'stevedore', [0.19]).state;
  assert.equal(state.player.strength, 21);
  assert.deepEqual(state.workProgress.stevedore, { shifts: 2, streak: 0, strengthGains: 1, strengthChance: 0.16 });
  assert.deepEqual(state.workProgress.ironworker, { shifts: 1, streak: 1, strengthGains: 0, strengthChance: 0.22 });
  assert.deepEqual(state.workProgress.ship_fabrication, { shifts: 0, streak: 0, strengthGains: 0, strengthChance: 0.08 });
});

test('training chance caps at 100%, and a guaranteed gain resets it', () => {
  const before = createInitialState();
  before.workProgress.stevedore.strengthChance = 0.98;
  before.workProgress.stevedore.streak = 8;
  const miss = shift(before, 'stevedore', [0.99, 0.999]);
  assert.equal(miss.state.workProgress.stevedore.strengthChance, 1);
  assert.equal(miss.entries[0].facts.increasePoints, 10);
  assert.equal(miss.entries[0].facts.actualIncreasePoints, 2);
  const recovered = sleepOutside(sleepOutside(miss.state));
  const gain = shift(recovered, 'stevedore', [0.999]);
  assert.equal(gain.state.player.strength, 21);
  assert.deepEqual(gain.state.workProgress.stevedore, { shifts: 2, streak: 0, strengthGains: 1, strengthChance: 0.16 });
});

test('configured strength lines advance per job, cap at the last line, and need no extra random draws', () => {
  const training = { strengthChance: 1, strengthGain: 1, minChanceGainPoints: 4, maxChanceGainPoints: 10 };
  const jobs = {
    hauling: new LegitWork({ name: 'Hauling', district: DISTRICTS.docks, business: TEST_BUSINESS, pay: 4,
      education: 0, hours: 1, energy: 0, strengthTraining: training,
      strengthTexts: ['First lift.', 'Second lift.', 'Steady hands.'] }),
    riveting: new LegitWork({ name: 'Riveting', district: DISTRICTS.docks, business: TEST_BUSINESS, pay: 4,
      education: 0, hours: 1, energy: 0, strengthTraining: training,
      strengthTexts: ['First rivet.'] })
  };
  let state = createInitialState(jobs);
  for (const [job, expected, index, count] of [
    ['hauling', 'First lift.', 0, 1],
    ['hauling', 'Second lift.', 1, 2],
    ['riveting', 'First rivet.', 0, 1],
    ['hauling', 'Steady hands.', 2, 3],
    ['hauling', 'Steady hands.', 2, 4]
  ]) {
    const result = shift(state, job, [0], jobs);
    assert.ok(result.entries[1].text.startsWith(expected));
    assert.equal(result.entries[1].facts.strengthTextIndex, index);
    assert.equal(result.state.workProgress[job].strengthGains, count);
    state = result.state;
  }
  assert.equal(state.player.strength, 25);
  assert.deepEqual(jobs.hauling.strengthTexts, ['First lift.', 'Second lift.', 'Steady hands.']);
  assert.ok(Object.isFrozen(jobs.hauling.strengthTexts));
});

test('strength texts require training and one to three nonblank entries', () => {
  const base = { name: 'Hauling', district: DISTRICTS.docks, business: TEST_BUSINESS, pay: 4,
    education: 0, hours: 1, energy: 0 };
  const strengthTraining = { strengthChance: 1, strengthGain: 1,
    minChanceGainPoints: 4, maxChanceGainPoints: 10 };
  assert.throws(() => new LegitWork({ ...base, strengthTexts: ['A'] }), /requires strengthTraining/);
  for (const strengthTexts of [[], ['', 'B'], ['A', 'B', 'C', 'D'], 'A'])
    assert.throws(() => new LegitWork({ ...base, strengthTraining, strengthTexts }), /one to three nonempty/);
});

test('energy and education requirements reject a shift without changing the save', () => {
  const state = createInitialState();
  state.player.energy = 79;
  const snapshot = structuredClone(state);
  assert.throws(() => shift(state, 'stevedore'), /Need 80 energy/);
  assert.deepEqual(state, snapshot);
  const skilled = { skilled: new LegitWork({ name: 'Skilled work', district: DISTRICTS.docks, business: TEST_BUSINESS,
    pay: 6, education: 1, hours: 8, energy: 10 }) };
  assert.throws(() => shift(state, 'skilled', [], skilled), /Need education 1/);
  assert.deepEqual(state, snapshot);
});

test('training is optional', () => {
  const jobs = {
    quiet: new LegitWork({ name: 'Quiet shift', district: DISTRICTS.docks, business: TEST_BUSINESS,
      pay: 4, education: 0, hours: 8, energy: 10 }),
    training: new LegitWork({ name: 'Training shift', district: DISTRICTS.docks, business: TEST_BUSINESS,
      pay: 4, education: 0, hours: 8, energy: 10,
      strengthTraining: { strengthChance: 1, strengthGain: 2, minChanceGainPoints: 4, maxChanceGainPoints: 10 } })
  };
  const before = createInitialState(jobs);
  const quiet = shift(before, 'quiet', [], jobs);
  assert.deepEqual(quiet.events.map(e => e.type), ['work']);
  assert.equal(quiet.state.player.strength, 20);
  const trained = shift(quiet.state, 'training', [0], jobs);
  assert.equal(trained.state.player.strength, 22);
});

test('unimplemented crime and crew actions remain unavailable', () => {
  const before = createInitialState();
  assert.deepEqual(Object.keys(before).sort(),
    ['version', 'nextEventId', 'nextNpcId', 'totalJournalEntries', 'elapsedHours', 'calendar',
      'player', 'crime', 'lodging', 'workProgress', 'journal'].sort());
  assert.deepEqual(Object.keys(before.player).sort(),
    ['name', 'age', 'birthday', 'district', 'money', 'energy', 'finesse', 'strength', 'education'].sort());
  for (const type of ['scout', 'mug', 'rob_store', 'dispatch_crew', 'insult_thug'])
    assert.throws(() => applyAction(before, { type }), /Unknown action/);
  assert.deepEqual(before, createInitialState());
});
