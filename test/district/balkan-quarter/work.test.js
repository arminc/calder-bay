import { BALKAN_QUARTER_JOBS } from '../../../src/district/balkan-quarter/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('balkan_quarter', BALKAN_QUARTER_JOBS, [
  { id: 'bakery_hand', pay: 4.4, weekly: 22, education: 0, hours: 10, energy: 45 }
]);
