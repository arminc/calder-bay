// The $2,000 purchase is the bottom of the verified modest-house anchor.
import { DISTRICTS } from '../../district.js';
import { Home } from '../../home.js';

export const OUTSKIRTS_HOMES = Object.freeze({
  weathered_farm_cottage: new Home({
    id: 'weathered_farm_cottage', name: 'Weathered Farm Cottage',
    district: DISTRICTS.outskirts,
    description: 'An isolated cottage with a sound roof, a stove, and room away from city eyes.',
    shelter: 'great',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.06, goodEnergy: 90, badEnergy: 65,
    goodSleepText: 'The stove holds its heat and the distant road stays quiet all night.',
    badSleepText: 'Loose shutters knock in the wind and keep pulling you awake.',
    purchase: {
      cost: 2000, setupHours: 8, maintenanceCost: 3,
      maintenanceDurationHours: 168, maintenanceHours: 1
    }
  })
});
