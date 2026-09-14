import { Business } from '../../business.js';
import { DISTRICTS } from '../../district.js';

export const AUTO_DISTRICT_BUSINESSES = Object.freeze({
  victory_motor_works: new Business({
    id: 'victory_motor_works', name: 'Victory Motor Works', type: 'automobile garage',
    district: DISTRICTS.auto_district,
    description: 'A machine-row garage repairing engines, fitting parts, and servicing the city\'s motorcars.',
    jobIds: ['auto_mechanic']
  })
});
