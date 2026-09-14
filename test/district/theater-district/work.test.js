import { THEATER_DISTRICT_JOBS } from '../../../src/district/theater-district/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('theater_district', THEATER_DISTRICT_JOBS, [
  { id: 'theater_stagehand', pay: 5, weekly: 25, education: 0, hours: 8, energy: 55, strengthChance: 0.08 }
]);
