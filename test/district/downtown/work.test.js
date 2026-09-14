import { DOWNTOWN_JOBS } from '../../../src/district/downtown/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('downtown', DOWNTOWN_JOBS, [
  { id: 'bank_messenger', pay: 5, weekly: 25, education: 1, hours: 8, energy: 25 }
]);
