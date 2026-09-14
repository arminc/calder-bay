import { OUTSKIRTS_JOBS } from '../../../src/district/outskirts/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('outskirts', OUTSKIRTS_JOBS, [
  { id: 'farmhand', pay: 3.2, weekly: 16, education: 0, hours: 10, energy: 70, strengthChance: 0.14 }
]);
