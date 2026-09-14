import { IRISH_QUARTER_JOBS } from '../../../src/district/irish-quarter/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('irish_quarter', IRISH_QUARTER_JOBS, [
  { id: 'union_teamster', pay: 5.6, weekly: 28, education: 0, hours: 10, energy: 65, strengthChance: 0.12 }
]);
