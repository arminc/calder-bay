import { INDUSTRIAL_DISTRICT_JOBS } from '../../../src/district/industrial-district/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('industrial_district', INDUSTRIAL_DISTRICT_JOBS, [
  { id: 'warehouse_porter', pay: 4.8, weekly: 24, education: 0, hours: 10, energy: 70, strengthChance: 0.14 }
]);
