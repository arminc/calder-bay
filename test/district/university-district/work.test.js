import { UNIVERSITY_DISTRICT_JOBS } from '../../../src/district/university-district/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('university_district', UNIVERSITY_DISTRICT_JOBS, [
  { id: 'library_assistant', pay: 5, weekly: 25, education: 2, hours: 8, energy: 15 }
]);
