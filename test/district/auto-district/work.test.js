import { AUTO_DISTRICT_JOBS } from '../../../src/district/auto-district/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('auto_district', AUTO_DISTRICT_JOBS, [
  { id: 'auto_mechanic', pay: 7.5, weekly: 37.5, education: 2, hours: 10, energy: 45 }
]);
