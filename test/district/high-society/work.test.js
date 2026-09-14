import { HIGH_SOCIETY_JOBS } from '../../../src/district/high-society/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('high_society', HIGH_SOCIETY_JOBS, [
  { id: 'private_chauffeur', pay: 7, weekly: 35, education: 1, hours: 10, energy: 25 }
]);
