import { LITTLE_ITALY_JOBS } from '../../../src/district/little-italy/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('little_italy', LITTLE_ITALY_JOBS, [
  { id: 'neighborhood_grocer', pay: 4, weekly: 20, education: 0, hours: 10, energy: 35 }
]);
