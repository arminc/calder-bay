import { TENDERLOIN_JOBS } from '../../../src/district/tenderloin/work.js';
import { testDistrictWork } from '../work-contract.js';

testDistrictWork('tenderloin', TENDERLOIN_JOBS, [
  { id: 'card_room_dealer', pay: 5.5, weekly: 27.5, education: 1, hours: 10, energy: 30 }
]);
