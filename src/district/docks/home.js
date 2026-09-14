// Named Docks homes. The $7/week room is about $30/month, below the
// ~$60/month NYC apartment anchor; the $0.50 hotel totals $3.50/week.
import { DISTRICTS } from '../../district.js';
import { Home } from '../../home.js';

export const DEFAULT_HOME_ID = 'docks_homeless';

export const DOCK_HOMES = Object.freeze({
  docks_homeless: new Home({
    id: 'docks_homeless', name: 'Homeless — sleeping rough in the Docks',
    district: DISTRICTS.docks,
    description: 'A free place outdoors, exposed to cold and street noise.',
    shelter: 'exposed',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.4, goodEnergy: 50, badEnergy: 25,
    goodSleepText: 'You find a sheltered spot and sleep undisturbed.',
    badSleepText: 'Cold and street noise interrupt your sleep.'
  }),
  harbor_house_hotel: new Home({
    id: 'harbor_house_hotel', name: 'Harbor House Hotel',
    district: DISTRICTS.docks,
    description: 'An inexpensive Docks hotel with a bed behind a door.',
    shelter: 'poor',
    sleepHours: 8, nightlyCost: 0.5, badSleepChance: 0.15, goodEnergy: 60, badEnergy: 40,
    goodSleepText: 'A bed at Harbor House gives you a decent night.',
    badSleepText: 'Thin walls and hallway noise at Harbor House keep waking you.'
  }),
  pier_street_room: new Home({
    id: 'pier_street_room', name: 'Pier Street Room',
    district: DISTRICTS.docks,
    description: 'A private rented room near the waterfront.',
    shelter: 'standard',
    sleepHours: 8, nightlyCost: 0, badSleepChance: 0.05, goodEnergy: 80, badEnergy: 55,
    goodSleepText: 'The privacy of your Pier Street Room lets you sleep soundly.',
    badSleepText: 'Even in your Pier Street Room, you have a restless night.',
    rental: { cost: 7, durationHours: 168, setupHours: 1 }
  })
});
