// The $6,300 purchase is the top of the verified modest-house anchor: a prestigious
// townhouse, not an estate or mansion. Upkeep is deliberately substantial.
import { DISTRICTS } from '../../district.js';
import { Home } from '../../home.js';

export const HIGH_SOCIETY_HOMES = Object.freeze({
  hill_townhouse: new Home({
    id: 'hill_townhouse', name: 'Hill Townhouse',
    district: DISTRICTS.high_society,
    description: 'A respectable townhouse on the edge of the Hill, with privacy and a prestigious address.',
    shelter: 'best',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.02, goodEnergy: 100, badEnergy: 75,
    goodSleepText: 'Heavy curtains, a quiet street, and a well-kept room give you complete rest.',
    badSleepText: 'Household repairs and an unsettled mind make the expensive bed little comfort.',
    purchase: {
      cost: 6300, setupHours: 8, maintenanceCost: 10,
      maintenanceDurationHours: 168, maintenanceHours: 1
    }
  })
});
