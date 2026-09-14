import { TENEMENT_JOBS } from '../../../src/district/tenements/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('tenements', TENEMENT_JOBS, [
  { id: 'coal_delivery_hand', pay: 3.6, weekly: 18, education: 0, hours: 10, energy: 70, strengthChance: 0.14 }
]);
