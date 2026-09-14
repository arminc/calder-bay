import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAYS_PER_YEAR, HOURS_PER_YEAR, applyAction, clockAt, createInitialState,
  seasonForDate, seasonalSleepModifiers, sequenceRandom
} from '../src/engine.js';

test('the visible 365-day calendar starts on 1 June and wraps without displaying a year', () => {
  assert.equal(DAYS_PER_YEAR, 365);
  assert.deepEqual(clockAt(0), {
    month: 6, monthName: 'June', day: 1, hour: 0, yearIndex: 0, yearsPassed: 0,
    season: 'spring', label: '1 June · 00:00'
  });
  assert.equal(clockAt(23).label, '1 June · 23:00');
  assert.equal(clockAt(24).label, '2 June · 00:00');
  assert.equal(clockAt(214 * 24).label, '1 January · 00:00');
  const wrapped = clockAt(HOURS_PER_YEAR);
  assert.equal(wrapped.label, '1 June · 00:00');
  assert.equal(wrapped.yearsPassed, 1);
  assert.doesNotMatch(wrapped.label, /1920|1921/);
});

test('northern seasons change on fixed real-world-style dates', () => {
  const boundaries = [
    [[3, 19], 'winter'], [[3, 20], 'spring'],
    [[6, 20], 'spring'], [[6, 21], 'summer'],
    [[9, 21], 'summer'], [[9, 22], 'autumn'],
    [[12, 20], 'autumn'], [[12, 21], 'winter']
  ];
  for (const [[month, day], expected] of boundaries)
    assert.equal(seasonForDate(month, day), expected);
});

test('crossing the birthday advances age and records the causal birthday event', () => {
  const before = createInitialState();
  before.elapsedHours = HOURS_PER_YEAR - 1;
  const result = applyAction(before, { type: 'rent_room' }, { random: sequenceRandom([]) });
  assert.equal(result.state.elapsedHours, HOURS_PER_YEAR);
  assert.equal(result.state.calendar.yearsPassed, 1);
  assert.equal(result.state.player.age, 20);
  assert.deepEqual(result.state.player.birthday, { month: 6, day: 1 });
  assert.deepEqual(result.events.map(event => event.type), ['rent_room', 'birthday']);
  assert.equal(result.events[1].causeId, result.events[0].id);
  assert.match(result.entries[1].text, /now 20/);
  assert.equal(result.entries[1].facts.yearsPassed, 1);
});

test('crossing a season boundary updates the saved clock and explains the change', () => {
  const before = createInitialState();
  before.elapsedHours = 20 * 24 - 1;
  const result = applyAction(before, { type: 'rent_room' }, { random: sequenceRandom([]) });
  assert.equal(result.state.calendar.label, '21 June · 00:00');
  assert.equal(result.state.calendar.season, 'summer');
  assert.deepEqual(result.events.map(event => event.type), ['rent_room', 'season_changed']);
  assert.equal(result.events[1].causeId, result.events[0].id);
  assert.match(result.entries[1].text, /Summer has begun/);
});

test('ordinary, great, and best homes currently provide the same seasonal protection', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter']) {
    const standard = seasonalSleepModifiers(season, 'standard');
    assert.deepEqual(seasonalSleepModifiers(season, 'great'), standard);
    assert.deepEqual(seasonalSleepModifiers(season, 'best'), standard);
    assert.deepEqual(standard, { badSleepChance: 0, energy: 0 });
  }
});
