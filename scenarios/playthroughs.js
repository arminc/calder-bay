// Playthroughs are executable contracts: exact draws, consequences and numbers.
// There is no browser or wall clock; resting is the support action for work.
const work = job => ({ type: 'work', district: 'docks', job });
const rest = { type: 'rest' };

export const PLAYTHROUGHS = Object.freeze({
  dock_work_loop: {
    description: 'A dock worker recovers between shifts and tries each available job.',
    steps: [
      { label: 'Haul cargo; fail the 16% strength roll', action: work('stevedore'), draws: [0.9, 0],
        events: ['work'], expect: { 'player.money': 44, 'player.energy': 20,
          'workProgress.stevedore.strengthChance': 0.2, elapsedHours: 12 } },
      { label: 'Recover after cargo', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 70, elapsedHours: 20 } },
      { label: 'Finish recovering', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 100, elapsedHours: 28 } },
      { label: 'Ironwork strengthens the worker', action: work('ironworker'), draws: [0.1],
        events: ['work', 'body_adapts'], expect: { 'player.money': 49, 'player.energy': 20,
          'player.strength': 21, 'workProgress.ironworker.shifts': 1, elapsedHours: 40 } },
      { label: 'Recover after ironwork', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 70, elapsedHours: 48 } },
      { label: 'Finish recovering again', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 100, elapsedHours: 56 } },
      { label: 'Fabricate a ship component; miss the 8% roll', action: work('ship_fabrication'), draws: [0.9, 0.999],
        events: ['work'], expect: { 'player.money': 54.6, 'player.energy': 20,
          'workProgress.ship_fabrication.strengthChance': 0.18, elapsedHours: 68 } },
      { label: 'Rest for the next shift', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 70, elapsedHours: 76 } },
      { label: 'Return to full energy', action: rest, draws: [0.9], events: ['rest'],
        expect: { 'player.energy': 100, elapsedHours: 84 } }
    ]
  },
  docks_sleep_choices: {
    description: 'A worker tries outdoor sleep, the Docks hotel, and a rented room.',
    steps: [
      { label: 'Haul cargo', action: work('stevedore'), draws: [0.9, 0],
        events: ['work'], expect: { 'player.energy': 20, 'player.money': 44, elapsedHours: 12 } },
      { label: 'Sleep badly outside', action: { type: 'rest', place: 'outside' }, draws: [0.1],
        events: ['rest'], expect: { 'player.energy': 45, 'player.money': 44, elapsedHours: 20 } },
      { label: 'Pay for a decent hotel night', action: { type: 'rest', place: 'hotel' }, draws: [0.9],
        events: ['rest'], expect: { 'player.energy': 100, 'player.money': 43.5, elapsedHours: 28 } },
      { label: 'Work an iron shift', action: work('ironworker'), draws: [0.9, 0],
        events: ['work'], expect: { 'player.energy': 20, 'player.money': 48.5, elapsedHours: 40 } },
      { label: 'Rent a private Docks room for seven days', action: { type: 'rent_room' },
        events: ['rent_room'], expect: { 'player.money': 41.5,
          'lodging.roomRentedUntilHour': 209, elapsedHours: 41 } },
      { label: 'A rare restless night in the room', action: { type: 'rest', place: 'room' }, draws: [0.01],
        events: ['rest'], expect: { 'player.energy': 75, 'player.money': 41.5, elapsedHours: 49 } },
      { label: 'The room gives a full recovery next time', action: { type: 'rest', place: 'room' }, draws: [0.9],
        events: ['rest'], expect: { 'player.energy': 100, 'player.money': 41.5, elapsedHours: 57 } },
      { label: 'Work ship fabrication', action: work('ship_fabrication'), draws: [0.9, 0],
        events: ['work'], expect: { 'player.energy': 20, 'player.money': 47.1, elapsedHours: 69 } },
      { label: 'A sound room night restores a full shift of energy', action: { type: 'rest', place: 'room' }, draws: [0.9],
        events: ['rest'], expect: { 'player.energy': 100, 'player.money': 47.1, elapsedHours: 77 } }
    ]
  },
  property_ownership: {
    description: 'A cash-rich player buys a cottage, maintains it, and receives its rest benefit.',
    startingMoney: 2500,
    startingEnergy: 0,
    steps: [
      { label: 'Take a taxi from the Docks to the Outskirts',
        action: { type: 'travel', to: 'outskirts', mode: 'taxi' },
        events: ['travel'], expect: { 'player.money': 2499.2, 'player.district': 'outskirts', elapsedHours: 1 } },
      { label: 'Buy the weathered farm cottage',
        action: { type: 'buy_home', home: 'weathered_farm_cottage' },
        events: ['buy_home'], expect: { 'player.money': 499.2, elapsedHours: 9,
          'lodging.homes.weathered_farm_cottage.owned': true,
          'lodging.homes.weathered_farm_cottage.maintainedUntilHour': 177 } },
      { label: 'Pay the next week of cottage maintenance early',
        action: { type: 'maintain_home', home: 'weathered_farm_cottage' },
        events: ['maintain_home'], expect: { 'player.money': 496.2, elapsedHours: 10,
          'lodging.homes.weathered_farm_cottage.maintainedUntilHour': 345 } },
      { label: 'Sleep soundly in the maintained cottage',
        action: { type: 'rest', home: 'weathered_farm_cottage' }, draws: [0.9],
        events: ['rest'], expect: { 'player.money': 496.2, 'player.energy': 90, elapsedHours: 18 } }
    ]
  }
});
