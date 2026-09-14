import { RAIL_YARD_JOBS } from '../../../src/district/rail-yards/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('rail_yards', RAIL_YARD_JOBS, [
  { id: 'freight_switchman', pay: 5.6, weekly: 28, education: 1, hours: 12, energy: 65, strengthChance: 0.08 }
]);
