import { DISTRICTS } from '../../district.js';
import { LegitWork } from '../../work.js';
import { AUTO_DISTRICT_BUSINESSES } from './business.js';

export const AUTO_DISTRICT_JOBS = Object.freeze({
  auto_mechanic: new LegitWork({
    name: 'Automobile mechanic', district: DISTRICTS.auto_district,
    business: AUTO_DISTRICT_BUSINESSES.victory_motor_works, pay: 7.5,
    education: 2, hours: 10, energy: 45
  })
});
