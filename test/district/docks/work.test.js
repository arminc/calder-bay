import { DOCK_JOBS } from '../../../src/district/docks/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('docks', DOCK_JOBS, [
  { id: 'stevedore', pay: 4, weekly: 20, education: 0, hours: 12, energy: 80, strengthChance: 0.16 },
  { id: 'ironworker', pay: 5, weekly: 25, education: 0, hours: 12, energy: 80, strengthChance: 0.12 },
  { id: 'ship_fabrication', pay: 5.6, weekly: 28, education: 0, hours: 12, energy: 80, strengthChance: 0.08 }
]);
