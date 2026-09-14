import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_HOMES, DISTRICT_HOMES, DISTRICTS, Home, applyAction, createInitialState, sequenceRandom
} from '../src/engine.js';

const act = (state, action, draws = []) => applyAction(state, action,
  { random: sequenceRandom(draws) });

test('housing is deliberately limited to five districts and seven distinct sleep options', () => {
  assert.deepEqual(Object.keys(DISTRICT_HOMES),
    ['docks', 'tenements', 'little_italy', 'outskirts', 'high_society']);
  assert.deepEqual(Object.keys(ALL_HOMES), [
    'docks_homeless', 'harbor_house_hotel', 'pier_street_room',
    'mulberry_court_room', 'rear_courtyard_flat',
    'weathered_farm_cottage', 'hill_townhouse'
  ]);
  assert.equal(new Set(Object.values(ALL_HOMES).map(home => home.district.id)).size, 5);
  assert.ok(Object.values(ALL_HOMES).every(home => Object.isFrozen(home)));
});

test('rental and purchase prices use the agreed 1920-dollar progression', () => {
  assert.deepEqual([
    [ALL_HOMES.pier_street_room.rental.cost, ALL_HOMES.pier_street_room.shelter],
    [ALL_HOMES.mulberry_court_room.rental.cost, ALL_HOMES.mulberry_court_room.shelter],
    [ALL_HOMES.rear_courtyard_flat.rental.cost, ALL_HOMES.rear_courtyard_flat.shelter]
  ], [[7, 'standard'], [5, 'standard'], [12, 'great']]);
  assert.deepEqual(ALL_HOMES.weathered_farm_cottage.purchase, {
    cost: 2000, setupHours: 8, maintenanceCost: 3,
    maintenanceDurationHours: 168, maintenanceHours: 1
  });
  assert.deepEqual(ALL_HOMES.hill_townhouse.purchase, {
    cost: 6300, setupHours: 8, maintenanceCost: 10,
    maintenanceDurationHours: 168, maintenanceHours: 1
  });
});

test('a district rental grants seven days and explains its deterministic rest outcome', () => {
  const before = createInitialState();
  before.player.district = 'tenements';
  const beforeSnapshot = structuredClone(before);
  const rented = act(before, { type: 'rent_home', home: 'mulberry_court_room' });
  assert.equal(rented.state.player.money, 35);
  assert.equal(rented.state.elapsedHours, 1);
  assert.equal(rented.state.lodging.homes.mulberry_court_room.rentedUntilHour, 169);
  assert.match(rented.entries[0].text, /Mulberry Court Room.*seven days/);
  rented.state.player.energy = 0;
  const rested = act(rented.state, { type: 'rest', home: 'mulberry_court_room' }, [0.9]);
  assert.equal(rested.state.player.energy, 70);
  assert.equal(rested.entries[0].facts.home, 'mulberry_court_room');
  assert.equal(rested.entries[0].facts.district, 'tenements');
  assert.equal(rested.entries[0].facts.badSleep, false);
  assert.deepEqual(before, beforeSnapshot);
});

test('buying a cottage creates permanent ownership and includes the first maintained week', () => {
  const before = createInitialState();
  before.player.district = 'outskirts';
  before.player.money = 2500;
  const bought = act(before, { type: 'buy_home', home: 'weathered_farm_cottage' });
  assert.equal(bought.state.player.money, 500);
  assert.equal(bought.state.elapsedHours, 8);
  assert.deepEqual(bought.state.lodging.homes.weathered_farm_cottage,
    { owned: true, maintainedUntilHour: 176 });
  assert.equal(bought.entries[0].facts.reason,
    'the completed purchase includes the first maintenance period');
  assert.match(bought.entries[0].text, /\$2000\.00.*first seven days/);
  assert.deepEqual(before.lodging.homes.weathered_farm_cottage,
    { owned: false, maintainedUntilHour: null });
});

test('owned-home maintenance renews without losing paid time and enables rest', () => {
  const before = createInitialState();
  before.player.district = 'outskirts';
  before.player.money = 2500;
  const bought = act(before, { type: 'buy_home', home: 'weathered_farm_cottage' }).state;
  bought.elapsedHours = 160;
  const maintained = act(bought, { type: 'maintain_home', home: 'weathered_farm_cottage' });
  assert.equal(maintained.state.player.money, 497);
  assert.equal(maintained.state.elapsedHours, 161);
  assert.equal(maintained.state.lodging.homes.weathered_farm_cottage.maintainedUntilHour, 344);
  maintained.state.player.energy = 0;
  const rested = act(maintained.state,
    { type: 'rest', home: 'weathered_farm_cottage' }, [0.9]);
  assert.equal(rested.state.player.energy, 90);
  assert.equal(rested.entries[0].facts.shelter, 'great');
});

test('expired maintenance blocks use but never removes ownership', () => {
  const before = createInitialState();
  before.player.district = 'outskirts';
  before.player.money = 2500;
  const state = act(before, { type: 'buy_home', home: 'weathered_farm_cottage' }).state;
  state.elapsedHours = 169;
  const snapshot = structuredClone(state);
  assert.throws(() => act(state,
    { type: 'rest', home: 'weathered_farm_cottage' }, [0.9]), /Maintain Weathered Farm Cottage/);
  assert.equal(state.lodging.homes.weathered_farm_cottage.owned, true);
  assert.deepEqual(state, snapshot);
});

test('invalid, duplicate, and unaffordable property actions leave the save unchanged', () => {
  const poor = createInitialState();
  poor.player.district = 'outskirts';
  const poorSnapshot = structuredClone(poor);
  assert.throws(() => act(poor,
    { type: 'buy_home', home: 'weathered_farm_cottage' }), /Need \$2000\.00/);
  assert.throws(() => act(poor,
    { type: 'maintain_home', home: 'weathered_farm_cottage' }), /before maintaining/);
  assert.throws(() => act(poor,
    { type: 'buy_home', home: 'rear_courtyard_flat' }), /cannot be purchased/);
  assert.deepEqual(poor, poorSnapshot);

  const owner = createInitialState();
  owner.player.district = 'outskirts';
  owner.player.money = 2500;
  const bought = act(owner, { type: 'buy_home', home: 'weathered_farm_cottage' }).state;
  const boughtSnapshot = structuredClone(bought);
  assert.throws(() => act(bought,
    { type: 'buy_home', home: 'weathered_farm_cottage' }), /already own/);
  assert.deepEqual(bought, boughtSnapshot);
});

test('Home rejects mixed rental and purchase arrangements', () => {
  const base = {
    id: 'invalid', name: 'Invalid Home', district: DISTRICTS.docks, description: 'Invalid.',
    shelter: 'standard', sleepHours: 8, nightlyCost: 0, badSleepChance: 0,
    goodEnergy: 1, badEnergy: 1, goodSleepText: 'Good.', badSleepText: 'Bad.',
    rental: { cost: 1, durationHours: 168, setupHours: 1 },
    purchase: { cost: 2000, setupHours: 1, maintenanceCost: 1,
      maintenanceDurationHours: 168, maintenanceHours: 1 }
  };
  assert.throws(() => new Home(base), /cannot be both rented and purchased/);
});
