import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, createInitialState, RULES, sequenceRandom } from '../../../src/engine.js';

const rest = (state, place, draw) => applyAction(state, { type: 'rest', place },
  { random: sequenceRandom([draw]) });

test('Docks sleep options have ordered bad-night risk, recovery, and 1920-dollar cost', () => {
  assert.deepEqual(Object.values(RULES.rest.places).map(place => place.badSleepChance), [0.4, 0.15, 0.05]);
  const outcomes = [
    ['outside', 50, 25, 0],
    ['hotel', 60, 40, 0.5],
    ['room', 80, 55, 0]
  ];
  for (const [place, goodEnergy, badEnergy, cost] of outcomes) {
    let before = createInitialState();
    before.player.energy = 0;
    if (place === 'room') before = applyAction(before, { type: 'rent_room' },
      { random: sequenceRandom([]) }).state;
    const startingMoney = before.player.money;
    const good = rest(before, place, 0.9);
    const bad = rest(before, place, 0);
    assert.equal(good.state.player.energy, goodEnergy);
    assert.equal(bad.state.player.energy, badEnergy);
    assert.equal(good.state.player.money, startingMoney - cost);
    assert.equal(bad.state.player.money, startingMoney - cost);
    assert.equal(good.state.elapsedHours, before.elapsedHours + 8);
    assert.equal(bad.state.elapsedHours, before.elapsedHours + 8);
    assert.deepEqual(good.events.map(event => event.type), ['rest']);
    assert.equal(good.entries[0].facts.badSleep, false);
    assert.equal(bad.entries[0].facts.badSleep, true);
    assert.match(good.entries[0].text, /energy/);
    assert.match(bad.entries[0].text, /energy/);
  }
});

test('bad-sleep probability uses an exact exclusive boundary for each place', () => {
  for (const [place, rule] of Object.entries(RULES.rest.places)) {
    let before = createInitialState();
    if (place === 'room') before = applyAction(before, { type: 'rent_room' }).state;
    assert.equal(rest(before, place, rule.badSleepChance - 0.0001).entries[0].facts.badSleep, true);
    assert.equal(rest(before, place, rule.badSleepChance).entries[0].facts.badSleep, false);
  }
});

test('a room costs more per week than the hotel and has an explicit seven-day lease', () => {
  assert.equal(RULES.rentRoom.cost, 7);
  assert.equal(RULES.rest.places.hotel.cost * 7, 3.5);
  const before = createInitialState();
  const rented = applyAction(before, { type: 'rent_room' }, { random: sequenceRandom([]) });
  assert.equal(rented.state.player.money, 33);
  assert.equal(rented.state.elapsedHours, 1);
  assert.equal(rented.state.lodging.roomRentedUntilHour, 169);
  assert.match(rented.entries[0].text, /Docks.*seven days/);
  assert.deepEqual(before, createInitialState());
  const almostExpired = structuredClone(rented.state);
  almostExpired.elapsedHours = 161;
  assert.equal(rest(almostExpired, 'room', 0.9).state.elapsedHours, 169,
    'the lease covers a night ending exactly at expiration');
  almostExpired.elapsedHours = 162;
  const snapshot = structuredClone(almostExpired);
  assert.throws(() => rest(almostExpired, 'room', 0.9), /Rent a Docks room/);
  assert.deepEqual(almostExpired, snapshot);
  const renewed = applyAction(almostExpired, { type: 'rent_room' }).state;
  assert.equal(renewed.lodging.roomRentedUntilHour, 337,
    'renewing before expiration adds a full week without losing paid time');
});

test('invalid or unaffordable rest is rejected without time, money, or random draws', () => {
  const before = createInitialState();
  before.player.money = 0.25;
  const snapshot = structuredClone(before);
  assert.throws(() => rest(before, 'hotel', 0.9), /Need \$0\.50/);
  assert.throws(() => applyAction(before, { type: 'rent_room' }), /Need \$7\.00/);
  assert.throws(() => rest(before, 'room', 0.9), /Rent a Docks room/);
  assert.throws(() => rest(before, 'unknown', 0.9), /Unknown rest place/);
  assert.deepEqual(before, snapshot);
});

test('hotel or room recovery can enable another shift; an outside bad night cannot', () => {
  const before = createInitialState();
  before.player.energy = 20;
  const outside = rest(before, 'outside', 0).state;
  assert.throws(() => applyAction(outside, { type: 'work', district: 'docks', job: 'stevedore' }),
    /Need 80 energy/);
  const hotel = rest(before, 'hotel', 0.9).state;
  assert.equal(hotel.player.energy, 80);
  assert.equal(applyAction(hotel, { type: 'work', district: 'docks', job: 'stevedore' },
    { random: sequenceRandom([0.9, 0]) }).state.player.energy, 0);
  const rented = applyAction(before, { type: 'rent_room' }).state;
  assert.equal(rest(rented, 'room', 0.9).state.player.energy, 100);
});

test('rest reports actual energy restored when recovery reaches the cap', () => {
  const before = createInitialState();
  before.player.energy = 90;
  const result = rest(before, 'outside', 0.9);
  assert.equal(result.state.player.energy, 100);
  assert.equal(result.entries[0].facts.energyGain, 10);
  assert.equal(result.entries[0].facts.recoveryPotential, 50);
  assert.match(result.entries[0].text, /regain 10 energy/);
});

test('summer, autumn, and winter worsen exposed sleep by deterministic amounts', () => {
  const cases = [
    [20 * 24, 'summer', 0.45, -5],
    [113 * 24, 'autumn', 0.5, -8],
    [203 * 24, 'winter', 0.65, -20]
  ];
  for (const [elapsedHours, season, chance, energyPenalty] of cases) {
    const before = createInitialState();
    before.elapsedHours = elapsedHours;
    before.player.energy = 0;
    const result = rest(before, 'outside', chance - 0.01);
    assert.equal(result.entries[0].facts.season, season);
    assert.equal(result.entries[0].facts.chance, chance);
    assert.equal(result.entries[0].facts.seasonalEnergy, energyPenalty);
    assert.equal(result.entries[0].facts.badSleep, true);
    assert.match(result.entries[0].text, new RegExp(`${season} conditions`, 'i'));
  }
});

test('a drafty hotel is colder in winter while a normal room blocks seasonal penalties', () => {
  const winterHour = 203 * 24;
  const hotelState = createInitialState();
  hotelState.elapsedHours = winterHour;
  hotelState.player.energy = 0;
  const hotel = rest(hotelState, 'hotel', 0.2);
  assert.equal(hotel.entries[0].facts.chance, 0.25);
  assert.equal(hotel.entries[0].facts.seasonalEnergy, -10);
  assert.equal(hotel.state.player.energy, 30);

  const roomState = createInitialState();
  roomState.elapsedHours = winterHour;
  roomState.player.energy = 0;
  roomState.lodging.roomRentedUntilHour = winterHour + 8;
  const room = rest(roomState, 'room', 0.05);
  assert.equal(room.entries[0].facts.chance, 0.05);
  assert.equal(room.entries[0].facts.seasonalEnergy, 0);
  assert.equal(room.entries[0].facts.badSleep, false);
  assert.equal(room.state.player.energy, 80);
});
