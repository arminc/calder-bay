// A continuous lease is cheaper than a private Docks room, but buys crowded housing.
// All costs are 1920 U.S. dollars; see economic_anchors.md.
import { DISTRICTS } from '../../district.js';
import { Home } from '../../home.js';

export const TENEMENT_HOMES = Object.freeze({
  mulberry_court_room: new Home({
    id: 'mulberry_court_room', name: 'Mulberry Court Room',
    district: DISTRICTS.tenements,
    description: 'A cheap room in a crowded walk-up, warm but rarely quiet.',
    shelter: 'standard',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.12, goodEnergy: 70, badEnergy: 45,
    goodSleepText: 'Four walls keep out the weather, and Mulberry Court settles long enough for sleep.',
    badSleepText: 'Arguments in the stairwell and feet overhead break up your sleep.',
    rental: { cost: 5, durationHours: 168, setupHours: 1 }
  })
});
