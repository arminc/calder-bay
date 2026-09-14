import { GOVERNMENT_ROW_JOBS } from '../../../src/district/government-row/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('government_row', GOVERNMENT_ROW_JOBS, [
  { id: 'municipal_records_clerk', pay: 6, weekly: 30, education: 2, hours: 8, energy: 20 }
]);
