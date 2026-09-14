// $12/week is about $52/month, just below the ~$60/month NYC apartment anchor.
import { DISTRICTS } from '../../district.js';
import { Home } from '../../home.js';

export const LITTLE_ITALY_HOMES = Object.freeze({
  rear_courtyard_flat: new Home({
    id: 'rear_courtyard_flat', name: 'Rear Courtyard Flat',
    district: DISTRICTS.little_italy,
    description: 'A private flat above a family courtyard, secure and well kept.',
    shelter: 'great',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.04, goodEnergy: 90, badEnergy: 65,
    goodSleepText: 'The courtyard goes quiet behind its locked gate, and you sleep soundly.',
    badSleepText: 'A late family quarrel carries through the courtyard and wakes you.',
    rental: { cost: 12, durationHours: 168, setupHours: 1 }
  })
});
