import { CHINATOWN_JOBS } from '../../../src/district/chinatown/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('chinatown', CHINATOWN_JOBS, [
  { id: 'apothecary_assistant', pay: 5, weekly: 25, education: 1, hours: 10, energy: 30 }
]);
